
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Movie from "./models/movie.model.js";

const testDatabase = async () => {
  let testMovieId;

  try {
    await connectDB();

    // 1. Insert a temporary test movie
    const movie = await Movie.create({
      title: "IMovies Database Test",
      genre: ["Action", "Drama"],
      language: "English",
      duration: 120,
      description: "Temporary movie used to test MongoDB.",
      rating: 8,
    });

    testMovieId = movie._id;
    console.log("1. Movie saved successfully:", movie._id.toString());

    // 2. Retrieve the movie from MongoDB
    const savedMovie = await Movie.findById(testMovieId);

    if (!savedMovie) {
      throw new Error("Could not retrieve the test movie.");
    }

    console.log("2. Movie retrieved successfully:", savedMovie.title);

    // 3. Delete the temporary test movie
    await Movie.deleteOne({ _id: testMovieId });
    testMovieId = null;

    console.log("3. Temporary test movie deleted.");
    console.log("Database test passed!");
  } catch (error) {
    console.error("Database test failed:", error.message);

    // Clean up the test document if it was created
    if (testMovieId) {
      await Movie.deleteOne({ _id: testMovieId }).catch(() => {});
    }

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

testDatabase();
