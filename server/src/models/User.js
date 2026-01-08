import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    avatar: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, trim: true },
    passwordHash: { type: String, default: "" },
    pinHash: { type: String, default: "" },
    role: { type: String, enum: ["admin", "client", "staff", "marketer", "sales", "finance", "developer"], default: "client" },
    permissions: [{ type: String, default: "" }],
    access: {
      canView: { type: Boolean, default: true },
      canEdit: { type: Boolean, default: false },
      canDelete: { type: Boolean, default: false },
      dataScope: { type: String, enum: ["assigned", "all"], default: "assigned" },
      canSeePrices: { type: Boolean, default: false },
      canSeeFinance: { type: Boolean, default: false },
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    failedLogins: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    createdBy: { type: String, default: "system" }, // e.g. self-signup
  },
  { timestamps: true }
);

// Add indexes for faster authentication queries
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ email: 1, role: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
