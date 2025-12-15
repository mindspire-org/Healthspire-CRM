import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    client: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    status: { type: String, default: "new" },
    orderDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
