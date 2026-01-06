import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    expectedPrice: { type: String, default: "" },
    systemNeeded: { type: String, default: "" },
    type: { type: String, enum: ["Organization", "Person"], default: "Organization" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    status: { type: String, default: "New" },
    source: { type: String, default: "" },
    value: { type: String, default: "-" },
    lastContact: { type: Date },
    initials: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
    country: { type: String, default: "" },
    website: { type: String, default: "" },
    vatNumber: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    currency: { type: String, default: "" },
    currencySymbol: { type: String, default: "" },
    labels: [{ type: mongoose.Schema.Types.ObjectId, ref: "LeadLabel" }],
  },
  { timestamps: true }
);

LeadSchema.index({ name: 1 });
LeadSchema.index({ company: 1 });
LeadSchema.index({ email: 1 });
LeadSchema.index({ phone: 1 });
LeadSchema.index({ ownerId: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ source: 1 });

export default mongoose.model("Lead", LeadSchema);
