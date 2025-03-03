import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customers",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },
      quantity: Number,
      priceAtPurchase: Number,
    },
  ],
  totalAmount: Number,
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
});

OrderSchema.index({ customerId: 1 });
OrderSchema.index({ "products.productId": 1 });
OrderSchema.index({ status: 1 });

OrderSchema.pre("save", function (next) {
  this.totalAmount =
    Math.round(
      this.products.reduce(
        (sum, p) => sum + p.quantity! * p.priceAtPurchase!,
        0
      ) * 100
    ) / 100;

  next();
});

export default mongoose.model("orders", OrderSchema);
