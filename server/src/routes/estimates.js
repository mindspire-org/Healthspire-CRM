import express from "express";
import Estimate from "../models/Estimate.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Minimal upload handler for estimate attachments (PDF share)
const uploadDir = path.join(process.cwd(), "uploads");
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `estfile_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Upload estimate attachment
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    res.status(201).json({ name: req.file.originalname || "file", path: `/uploads/${req.file.filename}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List estimates with optional search and status
router.get("/", async (req, res) => {
  try {
    const { q = "", status, leadId } = req.query;
    const cond = {};
    if (q) cond.$or = [
      { number: new RegExp(q, "i") },
      { client: new RegExp(q, "i") },
    ];
    if (status && status !== "-") cond.status = status;
    if (leadId) cond.leadId = leadId;
    const list = await Estimate.find(cond).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one estimate
router.get("/:id", async (req, res) => {
  try {
    const row = await Estimate.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create estimate
router.post("/", async (req, res) => {
  try {
    const { client, clientId, leadId, estimateDate, validUntil, tax = 0, tax2 = 0, note = "", advancedAmount = 0, items = [], fileIds = [] } = req.body || {};
    if (!client) return res.status(400).json({ error: "client is required" });
    const number = String(Math.floor(Date.now() / 1000));
    const amount = Array.isArray(items) ? items.reduce((a, it) => a + Number(it.total || 0), 0) : 0;
    const doc = await Estimate.create({ number, client, clientId, leadId, estimateDate, validUntil, tax, tax2, note, advancedAmount, amount, items, fileIds });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update estimate (partial)
router.patch("/:id", async (req, res) => {
  try {
    const update = req.body || {};
    const doc = await Estimate.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete estimate
router.delete("/:id", async (req, res) => {
  try {
    await Estimate.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
