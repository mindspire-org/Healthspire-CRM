import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    status: { type: String, default: "New" },
    source: { type: String, default: "" },
    value: { type: String, default: "-" },
    lastContact: { type: Date },
    initials: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", LeadSchema);
