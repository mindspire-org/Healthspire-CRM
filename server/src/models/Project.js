import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    title: { type: String, default: "" },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    client: { type: String, default: "" },
    price: { type: Number, default: 0 },
    start: { type: Date },
    deadline: { type: Date },
    status: { type: String, default: "Open" },
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);
