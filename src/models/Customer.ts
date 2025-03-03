import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  location: String,
  gender: String,
});

export default mongoose.model("customers", CustomerSchema);
