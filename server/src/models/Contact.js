import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "" },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    avatar: { type: String, default: "" },
    labels: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", ContactSchema);
