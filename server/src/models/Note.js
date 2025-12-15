import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    title: { type: String, default: "" },
    text: { type: String, default: "" },
    private: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Note", NoteSchema);
