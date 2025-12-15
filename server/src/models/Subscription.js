import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    client: { type: String, default: "" },
    title: { type: String, default: "" },
    firstBillingDate: { type: Date },
    nextBillingDate: { type: Date },
    repeatEvery: { type: String, default: "monthly" },
    cycles: { type: Number, default: 0 },
    status: { type: String, default: "active" },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", SubscriptionSchema);
