
import Movie from "../models/movie.model.js";

// GET: Fetch all movies
export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error("Get movies error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch movies.",
    });
  }
};

// GET: Fetch one movie by ID
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    return res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID.",
      });
    }

    console.error("Get movie error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch movie.",
    });
  }
};

// POST: Add a new movie
export const createMovie = async (req, res) => {
  try {
    const {
      title,
      genre,
      language,
      duration,
      releaseDate,
      description,
      poster,
      trailerUrl,
      rating,
    } = req.body;

    const movie = await Movie.create({
      title,
      genre,
      language,
      duration,
      releaseDate,
      description,
      poster,
      trailerUrl,
      rating,
    });

    return res.status(201).json({
      success: true,
      message: "Movie created successfully.",
      movie,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create movie error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create movie.",
    });
  }
};

// PUT: Update an existing movie
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie updated successfully.",
      movie,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update movie error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update movie.",
    });
  }
};

// DELETE: Delete a movie
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie deleted successfully.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID.",
      });
    }

    console.error("Delete movie error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete movie.",
    });
  }
};
