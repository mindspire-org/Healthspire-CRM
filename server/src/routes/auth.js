import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Client from "../models/Client.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const TOKEN_TTL = process.env.JWT_TTL || "7d";

// Admin login
router.post("/admin/login", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) return res.status(400).json({ error: "Missing credentials" });

    const query = { $or: [{ email: identifier.toLowerCase() }, { username: identifier }] };
    const user = await User.findOne(query).lean(false);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (user.role !== "admin") return res.status(403).json({ error: "Unauthorized role" });
    if (user.status !== "active") {
      return res.status(403).json({ error: "Inactive user" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      user.failedLogins = (user.failedLogins || 0) + 1;
      await user.save().catch(()=>{});
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await User.updateOne({ _id: user._id }, { $set: { failedLogins: 0, lastLoginAt: new Date() } });
    const token = jwt.sign({ uid: user._id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Temporary alias to handle older frontend builds pointing to /admin/login1
router.post("/admin/login1", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) return res.status(400).json({ error: "Missing credentials" });

    const query = { $or: [{ email: identifier.toLowerCase() }, { username: identifier }] };
    const user = await User.findOne(query).lean(false);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (user.role !== "admin") return res.status(403).json({ error: "Unauthorized role" });
    if (user.status !== "active") {
      return res.status(403).json({ error: "Inactive user" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      user.failedLogins = (user.failedLogins || 0) + 1;
      await user.save().catch(()=>{});
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await User.updateOne({ _id: user._id }, { $set: { failedLogins: 0, lastLoginAt: new Date() } });
    const token = jwt.sign({ uid: user._id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Email availability
router.get("/email-available", async (req, res) => {
  try {
    const email = String(req.query.email || "").toLowerCase().trim();
    if (!email) return res.json({ available: false });
    const exists = await User.findOne({ email }).lean();
    res.json({ available: !exists });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Client register
router.post("/client/register", async (req, res) => {
  try {
    const { companyName, clientName, firstName, lastName, type, email, phone, password, industry, autoLogin } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const emailLc = String(email).toLowerCase().trim();
    const exists = await User.findOne({ email: emailLc });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    // password rules: 8+ with letters and numbers
    const strong = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!strong.test(password)) return res.status(400).json({ error: "Weak password" });

    const t = (type === "person" ? "person" : "org");
    const personName = (clientName && String(clientName).trim()) || `${String(firstName||"").trim()} ${String(lastName||"").trim()}`.trim();
    const company = t === "org" ? String(companyName || "").trim() : "";

    if (t === "org" && !company) return res.status(400).json({ error: "Company name required" });
    if (t === "person" && !personName) return res.status(400).json({ error: "Name required" });

    const clientDoc = await Client.create({
      type: t,
      company,
      person: personName,
      email: emailLc,
      phone: phone || "",
      labels: [],
      status: "active",
      createdBy: "self-signup",
    });

    const hash = await bcrypt.hash(password, 10);
    const userDoc = await User.create({
      email: emailLc,
      username: emailLc,
      passwordHash: hash,
      role: "client",
      status: "active",
      clientId: clientDoc._id,
      createdBy: "self-signup",
    });

    if (autoLogin) {
      const token = jwt.sign({ uid: userDoc._id, role: userDoc.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
      return res.status(201).json({ ok: true, token, user: { id: userDoc._id, email: userDoc.email, role: userDoc.role }, client: clientDoc });
    }

    res.status(201).json({ ok: true, client: clientDoc });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "Email already registered" });
    res.status(500).json({ error: e.message });
  }
});

export default router;
