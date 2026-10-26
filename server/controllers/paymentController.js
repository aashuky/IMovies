import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";

export const createPayment = async (req, res) => {
  try {
    const { bookingId, method } = req.body;

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Valid bookingId is required",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id,
    });

    if (!booking || booking.status !== "confirmed") {
      return res.status(404).json({
        success: false,
        message: "Valid confirmed booking not found",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(409).json({
        success: false,
        message: "Booking is already paid",
      });
    }

    const payment = await Payment.create({
      bookingId: booking._id,
      userId: req.user._id,
      amount: booking.totalAmount,
      method: method || "demo",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Payment record created; payment is pending",
      payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not create payment",
    });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user._id,
    })
      .populate("bookingId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch payments",
    });
  }
};