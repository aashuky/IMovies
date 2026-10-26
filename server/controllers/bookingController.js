
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";

export const createBooking = async (req, res) => {
  try {
    const { showId, seats } = req.body;

    if (!mongoose.isValidObjectId(showId)) {
      return res.status(400).json({
        success: false,
        message: "Valid showId is required",
      });
    }

    if (
      !Array.isArray(seats) ||
      seats.length === 0 ||
      seats.some((seat) => typeof seat !== "string" || !seat.trim()) ||
      new Set(seats).size !== seats.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Select unique seats",
      });
    }

    const show = await Show.findById(showId);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    if (new Date(show.showDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Show date must be in the future",
      });
    }

    // Check whether selected seats are already booked.
    const existingBookings = await Booking.find({
      showId,
      status: "confirmed",
      seats: { $in: seats },
    });

    const bookedSeats = new Set(
      existingBookings.flatMap((booking) => booking.seats)
    );

    const unavailableSeats = seats.filter((seat) =>
      bookedSeats.has(seat)
    );

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Some seats are already booked",
        unavailableSeats,
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      showId,
      seats,
      totalAmount: seats.length * show.price,
      status: "confirmed",
      paymentStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Booking created; payment is pending",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not create booking",
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user._id,
    })
      .populate({
        path: "showId",
        populate: [
          { path: "movieId", select: "title poster duration" },
          { path: "theaterId", select: "name location" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch bookings",
    });
  }
};
