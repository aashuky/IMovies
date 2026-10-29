
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { payForBookingDemo } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/demo/:bookingId", protect, payForBookingDemo);

export default router;
