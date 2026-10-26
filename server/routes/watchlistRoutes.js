import express from "express";
import {
  getMyWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../controllers/watchlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyWatchlist);
router.post("/", protect, addToWatchlist);
router.delete("/:movieId", protect, removeFromWatchlist);

export default router;