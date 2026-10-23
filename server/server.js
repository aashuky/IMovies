import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to IMovies API"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "IMovies server is running"
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();