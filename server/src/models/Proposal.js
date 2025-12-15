import mongoose from "mongoose";

const ProposalSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    client: { type: String, default: "" },
    title: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    proposalDate: { type: Date },
    validUntil: { type: Date },
    status: { type: String, default: "draft" },
  },
  { timestamps: true }
);

export default mongoose.model("Proposal", ProposalSchema);
