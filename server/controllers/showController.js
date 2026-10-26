
import mongoose from "mongoose";
import Show from "../models/show.model.js";

// GET: Fetch all shows
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movieId", "title genre language poster duration")
      .populate("theaterId", "name location screens")
      .sort({ showDate: 1 });

    return res.status(200).json({
      success: true,
      count: shows.length,
      shows,
    });
  } catch (error) {
    console.error("Get shows error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shows.",
    });
  }
};

// GET: Fetch one show
export const getShowById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid show ID.",
      });
    }

    const show = await Show.findById(req.params.id)
      .populate("movieId", "title genre language poster duration")
      .populate("theaterId", "name location screens");

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found.",
      });
    }

    return res.status(200).json({
      success: true,
      show,
    });
  } catch (error) {
    console.error("Get show error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch show.",
    });
  }
};

// POST: Create a show (admin only)
export const createShow = async (req, res) => {
  try {
    const {
      movieId,
      theaterId,
      screenNumber,
      showDate,
      showTime,
      price,
    } = req.body;

    if (
      !movieId ||
      !theaterId ||
      !screenNumber ||
      !showDate ||
      !showTime ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All show fields are required.",
      });
    }

    if (
      !mongoose.isValidObjectId(movieId) ||
      !mongoose.isValidObjectId(theaterId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID or theater ID.",
      });
    }

    const [movieExists, theater] = await Promise.all([
      mongoose.model("Movie").exists({ _id: movieId }),
      mongoose.model("Theater").findById(theaterId),
    ]);

    if (!movieExists) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: "Theater not found.",
      });
    }

    if (
      !Number.isInteger(Number(screenNumber)) ||
      Number(screenNumber) < 1 ||
      Number(screenNumber) > theater.screens
    ) {
      return res.status(400).json({
        success: false,
        message: `Screen number must be between 1 and ${theater.screens}.`,
      });
    }

    const parsedDate = new Date(showDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid show date.",
      });
    }

    const show = await Show.create({
      movieId,
      theaterId,
      screenNumber: Number(screenNumber),
      showDate: parsedDate,
      showTime,
      price,
    });

    return res.status(201).json({
      success: true,
      message: "Show created successfully.",
      show,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create show error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create show.",
    });
  }
};

// DELETE: Delete a show (admin only)
export const deleteShow = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid show ID.",
      });
    }

    const show = await Show.findByIdAndDelete(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Show deleted successfully.",
    });
  } catch (error) {
    console.error("Delete show error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete show.",
    });
  }
};
