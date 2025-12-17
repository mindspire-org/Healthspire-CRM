import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
    title: { type: String, default: "" },
    dueAt: { type: Date },
    repeat: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReminderSchema.index({ leadId: 1, dueAt: 1 });

export default mongoose.model("Reminder", ReminderSchema);
