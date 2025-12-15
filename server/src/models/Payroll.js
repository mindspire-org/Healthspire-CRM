import mongoose from "mongoose";

const PayrollSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    employee: { type: String, required: true },
    period: { type: String, required: true }, // YYYY-MM
    basic: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    net: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "processed", "paid"], default: "draft" },
  },
  { timestamps: true }
);

export default mongoose.model("Payroll", PayrollSchema);
