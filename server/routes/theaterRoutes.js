
import express from "express";
import {
  getTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
} from "../controllers/theaterController.js";
import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getTheaters);
router.get("/:id", getTheaterById);

router.post("/", protect, adminOnly, createTheater);
router.put("/:id", protect, adminOnly, updateTheater);
router.delete("/:id", protect, adminOnly, deleteTheater);

export default router;
