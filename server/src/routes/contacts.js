import { Router } from "express";
import Contact from "../models/Contact.js";

const router = Router();

// List
router.get("/", async (req, res) => {
  const q = req.query.q?.toString().trim();
  const leadId = req.query.leadId?.toString().trim();
  const filter = {};
  if (leadId) filter.leadId = leadId;
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { jobTitle: { $regex: q, $options: "i" } },
      { skype: { $regex: q, $options: "i" } },
    ];
  }
  const items = await Contact.find(filter).sort({ isPrimaryContact: -1, createdAt: -1 }).lean();
  res.json(items);
});

// Create
router.post("/", async (req, res) => {
  try {
    const doc = await Contact.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const doc = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const r = await Contact.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
