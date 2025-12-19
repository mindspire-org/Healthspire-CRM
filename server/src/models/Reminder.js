import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    estimateId: { type: mongoose.Schema.Types.ObjectId, ref: "Estimate" },
    title: { type: String, default: "" },
    dueAt: { type: Date },
    repeat: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReminderSchema.index({ leadId: 1, dueAt: 1 });
ReminderSchema.index({ invoiceId: 1, dueAt: 1 });
ReminderSchema.index({ estimateId: 1, dueAt: 1 });

ReminderSchema.pre("validate", function (next) {
  if (!this.leadId && !this.invoiceId && !this.estimateId) {
    return next(new Error("Either leadId, invoiceId, or estimateId is required"));
  }
  next();
});

export default mongoose.model("Reminder", ReminderSchema);
