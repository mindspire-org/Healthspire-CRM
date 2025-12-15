import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    client: { type: String, default: "" },
    title: { type: String, required: true },
    type: { type: String, default: "general" },
    labels: { type: [String], default: [] },
    assignedTo: { type: String, default: "" },
    status: { type: String, default: "open" },
    lastActivity: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", TicketSchema);
