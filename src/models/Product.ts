import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  stock: Number,
});

export default mongoose.model("products", ProductSchema);
