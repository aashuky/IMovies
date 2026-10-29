
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// Log in an existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// Get the currently logged-in user
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

export const updateMe = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const hasProfileChange = name !== undefined || email !== undefined;
    const hasPasswordChange = Boolean(newPassword);

    if (!hasProfileChange && !hasPasswordChange) {
      return res.status(400).json({
        success: false,
        message: "Provide a profile or password change.",
      });
    }

    const updates = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must contain at least 2 characters.",
        });
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid email address.",
        });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id },
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use.",
        });
      }
      updates.email = normalizedEmail;
    }

    if (hasPasswordChange) {
      if (typeof currentPassword !== "string" || !currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Enter your current password to set a new password.",
        });
      }
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must contain at least 6 characters.",
        });
      }
      const userWithPassword = await User.findById(req.user._id);
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        userWithPassword.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Your current password is incorrect.",
        });
      }
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already in use.",
      });
    }
    console.error("Update profile error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not update your profile.",
    });
  }
};
