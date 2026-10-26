import mongoose from "mongoose";
import Watchlist from "../models/watchlist.model.js";
import Movie from "../models/movie.model.js";

export const getMyWatchlist = async (req, res) => {
  try {
    const items = await Watchlist.find({
      userId: req.user._id,
    })
      .populate("movieId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      watchlist: items,
    });
  } catch (error) {
    console.error("Get watchlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch watchlist",
    });
  }
};

export const addToWatchlist = async (req, res) => {
  try {
    const { movieId } = req.body;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Valid movieId is required",
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const item = await Watchlist.create({
      userId: req.user._id,
      movieId,
    });

    return res.status(201).json({
      success: true,
      message: "Movie added to watchlist",
      item,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Movie is already in your watchlist",
      });
    }

    console.error("Add watchlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not add movie to watchlist",
    });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID",
      });
    }

    const item = await Watchlist.findOneAndDelete({
      userId: req.user._id,
      movieId,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Movie not found in your watchlist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie removed from watchlist",
    });
  } catch (error) {
    console.error("Remove watchlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not remove movie",
    });
  }
};