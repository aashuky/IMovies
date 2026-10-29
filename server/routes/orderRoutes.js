
import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.post("/", protect, createOrder);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);
router.patch("/:id/cancel", protect, cancelOrder);

export default router;
