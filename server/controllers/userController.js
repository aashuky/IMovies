
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";

// GET: All users (admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

// GET: User by ID (admin)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    const bookings = await Booking.find({ userId: req.params.id })
      .populate({ path: "showId", populate: [{ path: "movieId" }, { path: "theaterId" }] })
      .sort({ createdAt: -1 })
      .limit(10);
    return res.status(200).json({ success: true, user, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch user." });
  }
};

// PATCH: Update user role (admin)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be 'user' or 'admin'." });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, message: "User role updated.", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update user role." });
  }
};

// DELETE: Delete user (admin)
export const deleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account." });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, message: "User deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete user." });
  }
};
