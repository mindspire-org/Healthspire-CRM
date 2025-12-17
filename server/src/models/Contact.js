import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    name: { type: String, required: true },
    role: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    skype: { type: String, default: "" },
    avatar: { type: String, default: "" },
    labels: { type: [String], default: [] },
    isPrimaryContact: { type: Boolean, default: false },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
  },
  { timestamps: true }
);

ContactSchema.index({ leadId: 1 });

export default mongoose.model("Contact", ContactSchema);
