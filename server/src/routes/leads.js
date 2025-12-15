import { Router } from "express";
import Lead from "../models/Lead.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const q = req.query.q?.toString().trim();
    const filter = q
      ? { $or: [
          { name: { $regex: q, $options: "i" } },
          { company: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
        ] }
      : {};
    const items = await Lead.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const doc = await Lead.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const doc = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const r = await Lead.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
