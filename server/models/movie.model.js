import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: [String],
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    releaseDate: {
      type: Date,
    },
    description: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
    },
    trailerUrl: {
      type: String,
      trim: true,
      default: "",
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
