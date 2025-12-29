import { Router } from "express";
import Account from "../models/Account.js";

const router = Router();

// List accounts (optionally filter by type)
router.get("/", async (req, res) => {
  try {
    const type = req.query.type?.toString().trim().toLowerCase();
    const q = req.query.q?.toString().trim();
    const filter = {};
    if (type) filter.type = type;
    if (q) filter.$or = [{ code: new RegExp(q, "i") }, { name: new RegExp(q, "i") }];
    const docs = await Account.find(filter).sort({ code: 1 }).lean();
    res.json(docs);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Create account
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.code || !payload.name || !payload.type) {
      return res.status(400).json({ error: "code, name and type are required" });
    }
    const doc = await Account.create({
      code: String(payload.code).trim(),
      name: String(payload.name).trim(),
      type: String(payload.type).trim().toLowerCase(),
      parentCode: payload.parentCode ? String(payload.parentCode).trim() : null,
      isActive: payload.isActive !== false,
      meta: payload.meta || {},
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update account
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await Account.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
