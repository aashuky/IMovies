
import Order from "../models/order.model.js";
import TheaterProduct from "../models/theaterProduct.model.js";
import Theater from "../models/Theater.model.js";

// POST: Create an order
export const createOrder = async (req, res) => {
  try {
    const { theaterId, bookingId, items, deliveryType, seatNumber } = req.body;

    if (!theaterId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "theaterId and items are required." });
    }

    const theater = await Theater.findById(theaterId);
    if (!theater) return res.status(404).json({ success: false, message: "Theater not found." });

    // Validate products and calculate total
    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await TheaterProduct.findById(item.productId);
      if (!product || !product.isAvailable) {
        return res.status(400).json({ success: false, message: `Product "${item.productId}" is not available.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}".` });
      }
      enrichedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      userId: req.user._id,
      bookingId: bookingId || null,
      theaterId,
      items: enrichedItems,
      totalAmount,
      deliveryType: deliveryType || "counter",
      seatNumber: seatNumber || "",
      paymentStatus: "paid", // Demo - auto-confirm payment
      status: "confirmed",
    });

    // Reduce stock
    for (const item of enrichedItems) {
      await TheaterProduct.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("theaterId", "name location")
      .populate("bookingId");

    return res.status(201).json({ success: true, message: "Order placed successfully.", order: populatedOrder });
  } catch (error) {
    console.error("Create order error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to place order." });
  }
};

// GET: User's own orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("theaterId", "name location")
      .populate("items.productId", "name image category")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

// GET: All orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("theaterId", "name location")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

// PATCH: Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    return res.status(200).json({ success: true, message: "Order status updated.", order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update order." });
  }
};

// DELETE: Cancel order (user can only cancel pending/confirmed)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    const isOwner = String(order.userId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({ success: false, message: "Only pending or confirmed orders can be cancelled." });
    }

    order.status = "cancelled";
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await TheaterProduct.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }

    return res.status(200).json({ success: true, message: "Order cancelled.", order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to cancel order." });
  }
};
