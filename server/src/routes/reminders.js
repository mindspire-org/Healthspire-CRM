import { Router } from "express";
import Reminder from "../models/Reminder.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const leadId = req.query.leadId?.toString().trim();
    const invoiceId = req.query.invoiceId?.toString().trim();
    const estimateId = req.query.estimateId?.toString().trim();
    const subscriptionId = req.query.subscriptionId?.toString().trim();
    if (!leadId && !invoiceId && !estimateId && !subscriptionId) return res.status(400).json({ error: "leadId, invoiceId, estimateId, or subscriptionId is required" });

    const filter = {};
    if (leadId) filter.leadId = leadId;
    if (invoiceId) filter.invoiceId = invoiceId;
    if (estimateId) filter.estimateId = estimateId;
    if (subscriptionId) filter.subscriptionId = subscriptionId;

    const items = await Reminder.find(filter).sort({ dueAt: 1, createdAt: -1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const leadId = (req.body?.leadId?.toString?.() ?? "").trim();
    const invoiceId = (req.body?.invoiceId?.toString?.() ?? "").trim();
    const estimateId = (req.body?.estimateId?.toString?.() ?? "").trim();
    const subscriptionId = (req.body?.subscriptionId?.toString?.() ?? "").trim();
    if (!leadId && !invoiceId && !estimateId && !subscriptionId) return res.status(400).json({ error: "leadId, invoiceId, estimateId, or subscriptionId is required" });

    const title = (req.body?.title ?? "").toString();
    const repeat = Boolean(req.body?.repeat);
    const dueAt = req.body?.dueAt ? new Date(req.body.dueAt) : undefined;

    const doc = await Reminder.create({
      leadId: leadId || undefined,
      invoiceId: invoiceId || undefined,
      estimateId: estimateId || undefined,
      subscriptionId: subscriptionId || undefined,
      title,
      repeat,
      dueAt,
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const title = req.body?.title !== undefined ? (req.body.title ?? "").toString() : undefined;
    const repeat = req.body?.repeat !== undefined ? Boolean(req.body.repeat) : undefined;
    const dueAt = req.body?.dueAt !== undefined ? (req.body.dueAt ? new Date(req.body.dueAt) : undefined) : undefined;

    const payload = {};
    if (title !== undefined) payload.title = title;
    if (repeat !== undefined) payload.repeat = repeat;
    if (req.body?.dueAt !== undefined) payload.dueAt = dueAt;

    const doc = await Reminder.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const r = await Reminder.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
