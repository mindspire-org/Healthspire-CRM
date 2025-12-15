import mongoose from "mongoose";

const ContractSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    client: { type: String, default: "" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    title: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    contractDate: { type: Date },
    validUntil: { type: Date },
    status: { type: String, default: "Open" },
  },
  { timestamps: true }
);

export default mongoose.model("Contract", ContractSchema);
