
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import SeatReservation from "../models/seatReservation.model.js";

export const payForBookingDemo = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { method = "demo" } = req.body;

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!["demo", "upi", "card", "netbanking"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported payment method.",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(409).json({
        success: false,
        message: "This booking has already been paid.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This booking has been cancelled.",
      });
    }

    const reservations = await SeatReservation.find({
      bookingId: booking._id,
      userId: req.user._id,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (
      reservations.length !== booking.seats.length ||
      booking.paymentStatus !== "pending"
    ) {
      return res.status(409).json({
        success: false,
        message: "Seat reservation expired. Please select seats again.",
      });
    }

    // DEMO ONLY: this does not charge money or contact a payment gateway.
    const payment = await Payment.create({
      bookingId: booking._id,
      userId: req.user._id,
      amount: booking.totalAmount,
      method,
      transactionId: `DEMO-${new mongoose.Types.ObjectId().toString()}`,
      status: "success",
      paidAt: new Date(),
    });

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    await booking.save();

    await SeatReservation.updateMany(
      { bookingId: booking._id, userId: req.user._id },
      { $set: { status: "confirmed" }, $unset: { expiresAt: 1 } }
    );

    return res.json({
      success: true,
      message: "Demo payment successful. Booking confirmed.",
      payment,
      booking,
    });
  } catch (error) {
    console.error("Demo payment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not process demo payment.",
    });
  }
};
