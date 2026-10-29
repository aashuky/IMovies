import mongoose from "mongoose";

const theaterProductSchema = new mongoose.Schema(
  {
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "food",
        "beverage",
        "beverages",
        "drink",
        "drinks",
        "combo",
        "combos",
        "merchandise",
        "snack",
        "snacks",
        "dessert",
        "popcorn",
      ],
      default: "snack",
      lowercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
  },
  { timestamps: true }
);

const TheaterProduct = mongoose.model("TheaterProduct", theaterProductSchema);
export default TheaterProduct;
