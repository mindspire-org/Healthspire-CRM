import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    client: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    method: { type: String, default: "Cash" },
    date: { type: Date },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);
