import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import theaterRoutes from "./routes/theaterRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import theaterProductRoutes from "./routes/theaterProductRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

const allowedOrigins = new Set(
  (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

if (process.env.NODE_ENV !== "production") {
  for (const port of [5173, 5174]) {
    allowedOrigins.add(`http://localhost:${port}`);
    allowedOrigins.add(`http://127.0.0.1:${port}`);
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || process.env.CORS_ORIGIN === "*") {
        return callback(null, true);
      }
      return callback(new Error("This origin is not allowed by the API CORS policy."));
    },
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theaters", theaterRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/theater-products", theaterProductRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to IMovies API",
    version: "2.0.0",
    endpoints: [
      "/api/auth", "/api/movies", "/api/theaters", "/api/shows",
      "/api/bookings", "/api/payments", "/api/reviews", "/api/watchlist",
      "/api/theater-products", "/api/orders", "/api/users",
    ],
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "IMovies server is running",
    timestamp: new Date().toISOString(),
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