

import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getMyBookings,
  getShowSeats,
  getAllBookings,
  cancelBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/my", protect, getMyBookings);
router.get("/all", protect, adminOnly, getAllBookings);
router.get("/show/:showId/seats", protect, getShowSeats);
router.post("/", protect, createBooking);
router.patch("/:id/cancel", protect, cancelBooking);

export default router;
