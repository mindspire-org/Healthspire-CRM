import { Router } from "express";
import Leave from "../models/Leave.js";

const router = Router();

// List
router.get("/", async (req, res) => {
  try {
    const q = req.query.q?.toString().trim();
    const filter = q ? { $or: [{ name: { $regex: q, $options: 'i' } }, { type: { $regex: q, $options: 'i' } }] } : {};
    const items = await Leave.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Create (apply)
router.post("/", async (req, res) => {
  try {
    const doc = await Leave.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Approve/Reject/Update
router.put("/:id", async (req, res) => {
  try {
    const doc = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const r = await Leave.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
