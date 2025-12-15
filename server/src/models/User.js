import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "client", "staff"], default: "client" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    failedLogins: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    createdBy: { type: String, default: "system" }, // e.g. self-signup
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
