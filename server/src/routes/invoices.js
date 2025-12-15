import { Router } from "express";
import Invoice from "../models/Invoice.js";

const router = Router();

// List invoices with optional search and client filters
router.get("/", async (req, res) => {
  try {
    const q = req.query.q?.toString().trim();
    const clientId = req.query.clientId?.toString();
    const filter = {};
    if (clientId) filter.clientId = clientId;
    if (q) {
      Object.assign(filter, {
        $or: [
          { number: { $regex: q, $options: "i" } },
          { client: { $regex: q, $options: "i" } },
        ],
      });
    }
    const items = await Invoice.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Create invoice
router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const number = body.number || String(Math.floor(Date.now() / 1000));
    const doc = await Invoice.create({ ...body, number });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update invoice
router.put("/:id", async (req, res) => {
  try {
    const doc = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete invoice
router.delete("/:id", async (req, res) => {
  try {
    const r = await Invoice.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
