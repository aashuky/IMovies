import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Movie from "../models/movie.model.js";

export const getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID",
      });
    }

    const reviews = await Review.find({ movieId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch reviews",
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Valid movieId is required",
      });
    }

    if (
      typeof rating !== "number" ||
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 10
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 10",
      });
    }

    if (
      comment !== undefined &&
      (typeof comment !== "string" || comment.length > 1000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment must be a string of at most 1000 characters",
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const review = await Review.create({
      userId: req.user._id,
      movieId,
      rating,
      comment: comment || "",
    });

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this movie",
      });
    }

    console.error("Create review error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not create review",
    });
  }
};

export const deleteMyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      userId: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not delete review",
    });
  }
};