import express from "express";
import {
  getMovieReviews,
  createReview,
  deleteMyReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/movie/:movieId", getMovieReviews);
router.post("/", protect, createReview);
router.delete("/:reviewId", protect, deleteMyReview);

export default router;