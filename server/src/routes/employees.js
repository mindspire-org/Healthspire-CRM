import { Router } from "express";
import Employee from "../models/Employee.js";
import multer from "multer";
import path from "path";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads");
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `emp_${req.params.id || Date.now()}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// List with simple search
router.get("/", async (req, res) => {
  const q = req.query.q?.toString().trim();
  const filter = q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
          { department: { $regex: q, $options: "i" } },
          { role: { $regex: q, $options: "i" } },
        ],
      }
    : {};
  const items = await Employee.find(filter).sort({ createdAt: -1 }).lean();
  res.json(items);
});

// Create
router.post("/", async (req, res) => {
  try {
    const doc = await Employee.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Bulk insert
router.post("/bulk", async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return res.status(400).json({ error: "No items provided" });
    const inserted = await Employee.insertMany(items, { ordered: false });
    res.status(201).json({ ok: true, inserted: inserted.length });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Send invitations (stub)
router.post("/invite", async (req, res) => {
  try {
    const emails = Array.isArray(req.body?.emails) ? req.body.emails : [];
    res.json({ ok: true, count: emails.length });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get by id
router.get("/:id", async (req, res) => {
  try {
    const doc = await Employee.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const doc = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/avatar", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const avatarPath = `/uploads/${req.file.filename}`;
    const doc = await Employee.findByIdAndUpdate(
      req.params.id,
      { avatar: avatarPath },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const r = await Employee.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
