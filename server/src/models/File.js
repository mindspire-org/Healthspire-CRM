import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    name: { type: String, default: "" },
    path: { type: String, default: "" },
    size: { type: Number, default: 0 },
    mime: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("File", FileSchema);
