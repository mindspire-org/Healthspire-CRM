import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    client: { type: String, default: "" },
    title: { type: String, default: "" },
    start: { type: Date },
    end: { type: Date },
    type: { type: String, default: "meeting" },
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Event", EventSchema);
