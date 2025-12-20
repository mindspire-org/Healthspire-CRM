import { Router } from "express";
import Subscription from "../models/Subscription.js";
import Counter from "../models/Counter.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const q = req.query.q?.toString().trim();
    const clientId = req.query.clientId?.toString();
    const currency = req.query.currency?.toString().trim();
    const repeatEveryUnit = req.query.repeatEveryUnit?.toString().trim();
    const status = req.query.status?.toString().trim();
    const filter = {};
    if (clientId) filter.clientId = clientId;
    if (currency) filter.currency = currency;
    if (repeatEveryUnit) filter.repeatEveryUnit = repeatEveryUnit;
    if (status) filter.status = status;
    if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { client: { $regex: q, $options: "i" } }];
    const items = await Subscription.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Subscription.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try { const doc = await Subscription.create(req.body || {}); res.status(201).json(doc); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try { const doc = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!doc) return res.status(404).json({ error: "Not found" }); res.json(doc); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

router.post("/:id/cancel", async (req, res) => {
  try {
    const cancelledBy = (req.body?.cancelledBy ?? "").toString();
    const doc = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled", cancelledAt: new Date(), cancelledBy },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/reactivate", async (req, res) => {
  try {
    const doc = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: "active", cancelledAt: undefined, cancelledBy: "" },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/admin/backfill-nos", async (_req, res) => {
  try {
    const missing = await Subscription.find({ $or: [{ subscriptionNo: { $exists: false } }, { subscriptionNo: null }] })
      .sort({ createdAt: 1 })
      .select({ _id: 1 })
      .lean();

    let updated = 0;
    for (const s of missing) {
      // eslint-disable-next-line no-await-in-loop
      const c = await Counter.findOneAndUpdate(
        { key: "subscription" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      // eslint-disable-next-line no-await-in-loop
      await Subscription.findByIdAndUpdate(s._id, { subscriptionNo: c.value });
      updated += 1;
    }

    res.json({ ok: true, updated });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try { const r = await Subscription.findByIdAndDelete(req.params.id); if (!r) return res.status(404).json({ error: "Not found" }); res.json({ ok: true }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
