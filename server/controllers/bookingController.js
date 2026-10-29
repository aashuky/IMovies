
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import SeatReservation from "../models/seatReservation.model.js";

const SEAT_NAMES = Array.from({ length: 40 }, (_, i) => `S${i + 1}`);

export const getShowSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    if (!mongoose.isValidObjectId(showId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid show ID.",
      });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found.",
      });
    }

    const now = new Date();

    // Expired pending reservations ko explicitly clear karo.
    await SeatReservation.deleteMany({
      showId,
      status: "pending",
      expiresAt: { $lte: now },
    });

    const reservations = await SeatReservation.find({
      showId,
      $or: [
        { status: "confirmed" },
        { status: "pending", expiresAt: { $gt: now } },
      ],
    }).select("seatNumber");

    const bookedSeats = reservations.map((item) => item.seatNumber);

    return res.json({
      success: true,
      show,
      seats: SEAT_NAMES.map((seatNumber) => ({
        seatNumber,
        status: bookedSeats.includes(seatNumber)
          ? "booked"
          : "available",
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not load seats.",
    });
  }
};

export const createBooking = async (req, res) => {
  let booking;

  try {
    const { showId, seats } = req.body;

    if (
      !mongoose.isValidObjectId(showId) ||
      !Array.isArray(seats) ||
      seats.length === 0 ||
      seats.some((seat) => typeof seat !== "string") ||
      new Set(seats).size !== seats.length ||
      seats.some((seat) => !SEAT_NAMES.includes(seat))
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid show ID and unique seat numbers.",
      });
    }

    const show = await Show.findById(showId);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found.",
      });
    }

    const showDateTime = new Date(show.showDate);
    const timeMatch = String(show.showTime || "").match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
    );

    if (timeMatch) {
      let hour = Number(timeMatch[1]);
      const minute = Number(timeMatch[2]);
      const meridiem = timeMatch[3]?.toUpperCase();

      if (meridiem === "PM" && hour !== 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;

      showDateTime.setHours(hour, minute, 0, 0);
    }

    if (showDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "This show has already started or ended.",
      });
    }

    await SeatReservation.deleteMany({
      showId,
      status: "pending",
      expiresAt: { $lte: new Date() },
    });

    const existing = await SeatReservation.find({
      showId,
      seatNumber: { $in: seats },
    });

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "One or more seats are already reserved.",
        unavailableSeats: existing.map((item) => item.seatNumber),
      });
    }

    const price = Number(show.price);

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid show price.",
      });
    }

    booking = await Booking.create({
      userId: req.user._id,
      showId,
      seats,
      totalAmount: price * seats.length,
      status: "pending",
      paymentStatus: "pending",
    });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    try {
      await SeatReservation.insertMany(
        seats.map((seatNumber) => ({
          showId,
          seatNumber,
          bookingId: booking._id,
          userId: req.user._id,
          status: "pending",
          expiresAt,
        })),
        { ordered: true }
      );
    } catch (reservationError) {
      await Booking.findByIdAndDelete(booking._id);

      if (reservationError.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "A seat was just reserved by another user. Refresh seats and try again.",
        });
      }

      throw reservationError;
    }

    return res.status(201).json({
      success: true,
      message: "Seats temporarily reserved. Complete demo payment within 10 minutes.",
      booking,
      expiresAt,
    });
  } catch (error) {
    console.error("Create booking error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not create booking.",
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: "showId",
        populate: [
          { path: "movieId" },
          { path: "theaterId" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not load bookings.",
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate({
        path: "showId",
        populate: [
          { path: "movieId", select: "title poster" },
          { path: "theaterId", select: "name location" },
        ],
      })
      .sort({ createdAt: -1 });
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not load bookings." });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    const isOwner = String(booking.userId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled." });
    }

    booking.status = "cancelled";
    booking.paymentStatus = booking.paymentStatus === "paid" ? "refunded" : "pending";
    await booking.save();

    // Release seats
    await SeatReservation.deleteMany({ bookingId: booking._id });

    return res.json({ success: true, message: "Booking cancelled.", booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not cancel booking." });
  }
};
