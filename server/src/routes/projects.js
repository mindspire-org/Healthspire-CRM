import { Router } from "express";
import Project from "../models/Project.js";

const router = Router();

router.get("/", async (req, res) => {
  const q = req.query.q?.toString().trim();
  const employeeId = req.query.employeeId?.toString();
  const filter = {};
  if (employeeId) filter.employeeId = employeeId;
  if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { client: { $regex: q, $options: "i" } }];
  const items = await Project.find(filter).sort({ createdAt: -1 }).lean();
  res.json(items);
});

// Get single project by id
router.get("/:id", async (req, res) => {
  try {
    const doc = await Project.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const doc = await Project.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const doc = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const r = await Project.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
