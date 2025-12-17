import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    name: { type: String, default: "" },
    type: { type: String, default: "" },
    path: { type: String, default: "" },
    url: { type: String, default: "" },
    size: { type: Number, default: 0 },
    mime: { type: String, default: "" },
    uploadedBy: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("File", FileSchema);
