
import express from "express";
import {
  getShows,
  getShowById,
  createShow,
  deleteShow,
} from "../controllers/showController.js";
import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getShows);
router.get("/:id", getShowById);

router.post("/", protect, adminOnly, createShow);
router.delete("/:id", protect, adminOnly, deleteShow);

export default router;
