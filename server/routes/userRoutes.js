
import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, adminOnly, getUserById);
router.patch("/:id/role", protect, adminOnly, updateUserRole);
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;
