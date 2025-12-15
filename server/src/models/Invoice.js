import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    client: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    status: { type: String, default: "Unpaid" },
    issueDate: { type: Date },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", InvoiceSchema);
