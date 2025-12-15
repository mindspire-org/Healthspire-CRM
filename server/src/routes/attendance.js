import { Router } from "express";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

const router = Router();

// Helper: start/end of day
const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x;
};
const endOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(23,59,59,999);
  return x;
};

// List members with current clock state
router.get("/members", async (_req, res) => {
  try {
    const emps = await Employee.find({}).lean();
    const today = { $gte: startOfDay(), $lte: endOfDay() };
    const todays = await Attendance.find({ date: today }).lean();
    const list = emps.map((e) => {
      const open = todays.find((t) => String(t.employeeId) === String(e._id) && t.clockIn && !t.clockOut);
      const name = e.name || `${e.firstName || ""} ${e.lastName || ""}`.trim();
      const initials = (e.initials || name.split(" ").map((w)=>w[0]).join("").slice(0,2)).toUpperCase();
      return {
        employeeId: e._id,
        name,
        initials,
        clockedIn: !!open,
        startTime: open?.clockIn ? new Date(open.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : undefined,
      };
    });
    res.json(list);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Clock in
router.post("/clock-in", async (req, res) => {
  try {
    const { employeeId, name } = req.body || {};
    let empId = employeeId;
    if (!empId && name) {
      const emp = await Employee.findOne({ name });
      if (emp) empId = emp._id;
    }
    if (!empId) return res.status(400).json({ error: "employeeId or name required" });

    const now = new Date();
    const date = now;
    const existing = await Attendance.findOne({ employeeId: empId, date: { $gte: startOfDay(now), $lte: endOfDay(now) }, clockOut: { $exists: false } });
    if (existing) return res.json(existing);

    const doc = await Attendance.create({ employeeId: empId, name, date, clockIn: now });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Clock out
router.post("/clock-out", async (req, res) => {
  try {
    const { employeeId, name } = req.body || {};
    let empId = employeeId;
    if (!empId && name) {
      const emp = await Employee.findOne({ name });
      if (emp) empId = emp._id;
    }
    if (!empId) return res.status(400).json({ error: "employeeId or name required" });

    const now = new Date();
    const doc = await Attendance.findOneAndUpdate(
      { employeeId: empId, date: { $gte: startOfDay(now), $lte: endOfDay(now) }, clockOut: { $exists: false } },
      { $set: { clockOut: now } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "No open clock-in" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Manual add
router.post("/manual", async (req, res) => {
  try {
    const { employeeId, name, date, clockIn, clockOut, notes } = req.body || {};
    if (!employeeId && !name) return res.status(400).json({ error: "employeeId or name required" });
    const doc = await Attendance.create({
      employeeId,
      name,
      date: date ? new Date(date) : new Date(),
      clockIn: clockIn ? new Date(clockIn) : undefined,
      clockOut: clockOut ? new Date(clockOut) : undefined,
      notes: notes || "",
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// List records (optional filters)
router.get("/records", async (req, res) => {
  try {
    const { from, to, employeeId } = req.query;
    const filter = {};
    if (employeeId) filter.employeeId = employeeId;
    if (from || to) filter.date = { $gte: from ? new Date(String(from)) : startOfDay(), $lte: to ? new Date(String(to)) : endOfDay() };
    const items = await Attendance.find(filter).sort({ date: -1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
