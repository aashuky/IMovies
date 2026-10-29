
import TheaterProduct from "../models/theaterProduct.model.js";
import Theater from "../models/Theater.model.js";

// GET: All products for a theater
export const getProductsByTheater = async (req, res) => {
  try {
    const { theaterId } = req.params;
    const products = await TheaterProduct.find({ theaterId, isAvailable: true }).sort({ category: 1, name: 1 });
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
};

// GET: All products (admin)
export const getAllProducts = async (req, res) => {
  try {
    const products = await TheaterProduct.find()
      .populate("theaterId", "name location")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
};

// GET: Single product
export const getProductById = async (req, res) => {
  try {
    const product = await TheaterProduct.findById(req.params.id).populate("theaterId", "name location");
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch product." });
  }
};

// POST: Create product (admin only)
export const createProduct = async (req, res) => {
  try {
    const { theaterId, name, description, category, price, image, stock } = req.body;
    if (!theaterId || !name || price === undefined) {
      return res.status(400).json({ success: false, message: "theaterId, name, and price are required." });
    }
    const theater = await Theater.findById(theaterId);
    if (!theater) return res.status(404).json({ success: false, message: "Theater not found." });
    const product = await TheaterProduct.create({ theaterId, name, description, category, price, image, stock });
    return res.status(201).json({ success: true, message: "Product created.", product });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: "Failed to create product." });
  }
};

// PUT: Update product (admin only)
export const updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, image, isAvailable, stock } = req.body;
    const product = await TheaterProduct.findByIdAndUpdate(
      req.params.id,
      { name, description, category, price, image, isAvailable, stock },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    return res.status(200).json({ success: true, message: "Product updated.", product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update product." });
  }
};

// DELETE: Delete product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await TheaterProduct.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    return res.status(200).json({ success: true, message: "Product deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete product." });
  }
};
