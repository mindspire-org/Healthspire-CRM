import { Router } from "express";
import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";

const router = Router();

// List by period with optional search
router.get("/", async (req, res) => {
  try {
    const period = req.query.period?.toString() || new Date().toISOString().slice(0,7);
    const q = req.query.q?.toString().trim();
    const filter = { period };
    if (q) {
      Object.assign(filter, { employee: { $regex: q, $options: "i" } });
    }
    const items = await Payroll.find(filter).sort({ employee: 1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Run payroll for a period from Employees' salary
router.post("/run", async (req, res) => {
  try {
    const period = req.body?.period || req.query.period || new Date().toISOString().slice(0,7);
    const emps = await Employee.find({}).lean();
    const bulk = emps.map((e) => {
      const name = e.name || `${e.firstName || ""} ${e.lastName || ""}`.trim();
      const basic = Number(e.salary || 0) || 0;
      const allowances = 0;
      const deductions = 0;
      const net = basic + allowances - deductions;
      return {
        updateOne: {
          filter: { employeeId: e._id, period },
          update: { $set: { employeeId: e._id, employee: name, period, basic, allowances, deductions, net, status: "draft" } },
          upsert: true,
        },
      };
    });
    if (bulk.length) await Payroll.bulkWrite(bulk, { ordered: false });
    const items = await Payroll.find({ period }).sort({ employee: 1 }).lean();
    res.json({ ok: true, count: items.length, items });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update a payroll row
router.put("/:id", async (req, res) => {
  try {
    const doc = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
