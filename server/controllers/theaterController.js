
import Theater from "../models/Theater.model.js";

// GET: Fetch all theaters
export const getTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: theaters.length,
      theaters,
    });
  } catch (error) {
    console.error("Get theaters error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch theaters.",
    });
  }
};

// GET: Fetch one theater
export const getTheaterById = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: "Theater not found.",
      });
    }

    return res.status(200).json({
      success: true,
      theater,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid theater ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch theater.",
    });
  }
};

// POST: Create a theater (admin only)
export const createTheater = async (req, res) => {
  try {
    const { name, location, screens } = req.body;

    const theater = await Theater.create({
      name,
      location,
      screens,
    });

    return res.status(201).json({
      success: true,
      message: "Theater created successfully.",
      theater,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create theater error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create theater.",
    });
  }
};

// PUT: Update a theater (admin only)
export const updateTheater = async (req, res) => {
  try {
    const { name, location, screens } = req.body;

    const theater = await Theater.findByIdAndUpdate(
      req.params.id,
      { name, location, screens },
      { new: true, runValidators: true }
    );

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: "Theater not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Theater updated successfully.",
      theater,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid theater ID.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update theater.",
    });
  }
};

// DELETE: Delete a theater (admin only)
export const deleteTheater = async (req, res) => {
  try {
    const theater = await Theater.findByIdAndDelete(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: "Theater not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Theater deleted successfully.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid theater ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete theater.",
    });
  }
};
