
import mongoose from "mongoose";

const seatReservationSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Same show mein ek seat ki sirf ek reservation ho sakti hai.
seatReservationSchema.index(
  { showId: 1, seatNumber: 1 },
  { unique: true }
);

// Pending reservations expire ho jaane par automatically remove hongi.
seatReservationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const SeatReservation = mongoose.model(
  "SeatReservation",
  seatReservationSchema
);

export default SeatReservation;
