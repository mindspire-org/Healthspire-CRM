import { Router } from "express";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Client from "../models/Client.js";
import { authenticate, isAdmin } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.resolve(__dirname, "..", "..");
const uploadDir = path.join(SERVER_ROOT, "uploads");
function normalizeAvatar(v) {
  const raw = String(v || "").trim();
  if (!raw) return "";
  if (raw.startsWith("<")) return ""; // invalid placeholder
  // Already relative and points to uploads
  if (raw.startsWith("/uploads/")) return raw;
  try {
    const u = new URL(raw);
    // If URL path contains /uploads/<file>, return relative path
    if (u.pathname && /\/uploads\//.test(u.pathname)) {
      const idx = u.pathname.indexOf("/uploads/");
      return u.pathname.substring(idx);
    }
  } catch {
    // not a full URL
  }
  return raw;
}
const avatarStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `avatar_user_${String(req.user?._id || "user")}_${Date.now()}${ext}`);
  },
});
const uploadAvatar = multer({ storage: avatarStorage });

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = typeof req.user?.toObject === "function" ? req.user.toObject() : req.user;
    const role = String(user?.role || "").toLowerCase();

    let client = null;
    let employee = null;

    if (role === "client" && user?.clientId) {
      client = await Client.findById(user.clientId).lean();
    }

    if (role === "staff") {
      const email = String(user?.email || "").toLowerCase().trim();
      if (email) employee = await Employee.findOne({ email }).lean();
    }

    const displayName =
      String(user?.name || "").trim() ||
      (client ? String(client.company || client.person || "").trim() : "") ||
      (employee ? String(employee.name || "").trim() : "") ||
      String(user?.email || "").trim();

    const avatar = normalizeAvatar(
      String(user?.avatar || "").trim() ||
        (client ? String(client.avatar || "").trim() : "") ||
        (employee ? String(employee.avatar || "").trim() : "")
    );

    res.json({
      user: {
        _id: user?._id,
        id: user?._id,
        role: user?.role,
        email: user?.email,
        name: displayName,
        avatar,
        clientId: user?.clientId,
        permissions: user?.permissions || [],
      },
      client,
      employee,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean(false);
    if (!user) return res.status(404).json({ error: "User not found" });

    const role = String(user.role || "").toLowerCase();
    const { name, email, currentPassword, newPassword } = req.body || {};

    const updateUser = {};
    const emailNext = typeof email === "string" ? email.toLowerCase().trim() : "";
    const emailPrev = String(user.email || "").toLowerCase().trim();

    if (emailNext && emailNext !== emailPrev) {
      const exists = await User.findOne({ email: emailNext, _id: { $ne: user._id } }).lean();
      if (exists) return res.status(409).json({ error: "Email already in use" });
      updateUser.email = emailNext;
      updateUser.username = emailNext;
    }

    if (typeof name === "string" && name.trim()) {
      updateUser.name = name.trim();
    }

    // Password change
    if (newPassword) {
      const np = String(newPassword);
      if (np.length < 4) return res.status(400).json({ error: "Weak password" });

      const cp = String(currentPassword || "");

      if (role === "staff") {
        const emp = emailPrev ? await Employee.findOne({ email: emailPrev }).lean(false) : null;
        if (!emp || emp.disableLogin || emp.markAsInactive) {
          return res.status(403).json({ error: "Employee login is disabled" });
        }
        if (String(emp.password || "") !== cp) {
          return res.status(401).json({ error: "Current password is incorrect" });
        }
        emp.password = np;
        await emp.save();
      } else {
        if (!user.passwordHash) return res.status(400).json({ error: "Password not set" });
        const ok = await bcrypt.compare(cp, user.passwordHash);
        if (!ok) return res.status(401).json({ error: "Current password is incorrect" });
        const hash = await bcrypt.hash(np, 10);
        updateUser.passwordHash = hash;
      }
    }

    if (Object.keys(updateUser).length) {
      Object.assign(user, updateUser);
      await user.save();
    }

    // Sync to role-specific records
    const emailFinal = String(user.email || "").toLowerCase().trim();
    const nameFinal = String(user.name || "").trim();

    if (role === "client" && user.clientId) {
      const client = await Client.findById(user.clientId).lean(false);
      if (client) {
        if (emailFinal && String(client.email || "").toLowerCase().trim() !== emailFinal) client.email = emailFinal;
        if (nameFinal) {
          if (String(client.type || "org") === "person") client.person = nameFinal;
          else client.company = nameFinal;
        }
        await client.save();
      }
    }

    if (role === "staff") {
      const empPrev = emailPrev ? await Employee.findOne({ email: emailPrev }).lean(false) : null;
      if (empPrev) {
        if (emailFinal && String(empPrev.email || "").toLowerCase().trim() !== emailFinal) empPrev.email = emailFinal;
        if (nameFinal) empPrev.name = nameFinal;
        await empPrev.save();
      }
    }

    const refreshed = await User.findById(user._id).select("_id name email role avatar permissions clientId").lean();
    res.json({ user: refreshed });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/me/pin", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPin } = req.body || {};
    const pin = String(newPin || "").trim();
    if (!pin) return res.status(400).json({ error: "New PIN is required" });
    if (!/^\d{4,8}$/.test(pin)) return res.status(400).json({ error: "PIN must be 4-8 digits" });

    const user = await User.findById(req.user._id).lean(false);
    if (!user) return res.status(404).json({ error: "User not found" });

    const role = String(user.role || "").toLowerCase();
    const cp = String(currentPassword || "");
    if (!cp) return res.status(400).json({ error: "Current password is required" });

    const email = String(user.email || "").toLowerCase().trim();
    if (role === "staff") {
      const emp = email ? await Employee.findOne({ email }).lean(false) : null;
      if (!emp || emp.disableLogin || emp.markAsInactive) {
        return res.status(403).json({ error: "Employee login is disabled" });
      }
      if (String(emp.password || "") !== cp) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
    } else {
      if (!user.passwordHash) return res.status(400).json({ error: "Password not set" });
      const ok = await bcrypt.compare(cp, user.passwordHash);
      if (!ok) return res.status(401).json({ error: "Current password is incorrect" });
    }

    user.pinHash = await bcrypt.hash(pin, 10);
    await user.save();

    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/me/avatar", authenticate, uploadAvatar.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No avatar uploaded" });
    const rel = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: { avatar: rel } }, { new: true })
      .select("_id name email role avatar permissions clientId")
      .lean();

    const role = String(user?.role || "").toLowerCase();
    const email = String(user?.email || "").toLowerCase().trim();

    if (role === "client" && user?.clientId) {
      await Client.updateOne({ _id: user.clientId }, { $set: { avatar: rel } }).catch(() => null);
    }

    if (role === "staff" && email) {
      await Employee.updateOne({ email }, { $set: { avatar: rel } }).catch(() => null);
    }

    res.json({ user: { ...user, avatar: normalizeAvatar(rel) }, avatar: normalizeAvatar(rel) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

 router.get("/admin/list", authenticate, isAdmin, async (_req, res) => {
   try {
     const users = await User.find({})
       .sort({ createdAt: -1 })
       .select("name email username role status permissions access clientId createdAt updatedAt")
       .lean();
     res.json(users);
   } catch (e) {
     res.status(500).json({ error: e.message });
   }
 });

router.post("/admin/create", authenticate, isAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      password,
      pin,
      role,
      status,
      permissions,
      access,
    } = req.body || {};
    const emailLc = String(email || "").toLowerCase().trim();
    if (!emailLc) return res.status(400).json({ error: "Email is required" });

    const exists = await User.findOne({ email: emailLc }).lean();
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const nextUsername = String(username || "").trim() || emailLc;
    const nextUsernameLc = String(nextUsername).toLowerCase().trim();
    const usernameExists = await User.findOne({ username: nextUsernameLc }).lean();
    if (usernameExists) return res.status(409).json({ error: "Username already in use" });
    const nextRole = String(role || "staff");
    const nextStatus = String(status || "active");

    const accessDefaults = (() => {
      if (String(nextRole).toLowerCase() === "admin") {
        return { canView: true, canEdit: true, canDelete: true, dataScope: "all", canSeePrices: true, canSeeFinance: true };
      }
      return { canView: true, canEdit: false, canDelete: false, dataScope: "assigned", canSeePrices: false, canSeeFinance: false };
    })();

    const nextAccessRaw = access && typeof access === "object" ? access : {};
    const nextAccess = {
      canView: nextAccessRaw.canView !== undefined ? Boolean(nextAccessRaw.canView) : accessDefaults.canView,
      canEdit: nextAccessRaw.canEdit !== undefined ? Boolean(nextAccessRaw.canEdit) : accessDefaults.canEdit,
      canDelete: nextAccessRaw.canDelete !== undefined ? Boolean(nextAccessRaw.canDelete) : accessDefaults.canDelete,
      dataScope: ["assigned", "all"].includes(String(nextAccessRaw.dataScope || ""))
        ? String(nextAccessRaw.dataScope)
        : accessDefaults.dataScope,
      canSeePrices: nextAccessRaw.canSeePrices !== undefined ? Boolean(nextAccessRaw.canSeePrices) : accessDefaults.canSeePrices,
      canSeeFinance: nextAccessRaw.canSeeFinance !== undefined ? Boolean(nextAccessRaw.canSeeFinance) : accessDefaults.canSeeFinance,
    };

    const doc = {
      name: String(name || "").trim(),
      email: emailLc,
      username: nextUsernameLc,
      role: nextRole,
      status: nextStatus,
      permissions: Array.isArray(permissions) ? permissions.map((x) => String(x)) : [],
      access: nextAccess,
      createdBy: "admin",
    };

    if (password) {
      const np = String(password);
      if (np.length < 4) return res.status(400).json({ error: "Weak password" });
      doc.passwordHash = await bcrypt.hash(np, 10);
    }

    if (pin) {
      const p = String(pin).trim();
      if (!/^\d{4,8}$/.test(p)) return res.status(400).json({ error: "PIN must be 4-8 digits" });
      doc.pinHash = await bcrypt.hash(p, 10);
    }

    const created = await User.create(doc);
    const out = await User.findById(created._id).select("name email username role status permissions access clientId createdAt updatedAt").lean();
    res.status(201).json(out);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/admin/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, username, role, status, permissions, access } = req.body || {};
    const update = {};

    if (name !== undefined) update.name = String(name || "").trim();

    if (email !== undefined) {
      const nextEmail = String(email || "").toLowerCase().trim();
      if (!nextEmail) return res.status(400).json({ error: "Email is required" });
      const emailExists = await User.findOne({ email: nextEmail, _id: { $ne: req.params.id } }).lean();
      if (emailExists) return res.status(409).json({ error: "Email already in use" });
      update.email = nextEmail;
    }

    if (username !== undefined) {
      const nextUsername = String(username || "").toLowerCase().trim();
      if (!nextUsername) return res.status(400).json({ error: "Username is required" });
      const usernameExists = await User.findOne({ username: nextUsername, _id: { $ne: req.params.id } }).lean();
      if (usernameExists) return res.status(409).json({ error: "Username already in use" });
      update.username = nextUsername;
    }

    if (role) update.role = role;
    if (status) update.status = status;
    if (Array.isArray(permissions)) update.permissions = permissions.map((x) => String(x));

    if (access !== undefined) {
      const a = access && typeof access === "object" ? access : {};
      const ds = String(a.dataScope || "");
      update.access = {
        canView: a.canView !== undefined ? Boolean(a.canView) : true,
        canEdit: a.canEdit !== undefined ? Boolean(a.canEdit) : false,
        canDelete: a.canDelete !== undefined ? Boolean(a.canDelete) : false,
        dataScope: ["assigned", "all"].includes(ds) ? ds : "assigned",
        canSeePrices: a.canSeePrices !== undefined ? Boolean(a.canSeePrices) : false,
        canSeeFinance: a.canSeeFinance !== undefined ? Boolean(a.canSeeFinance) : false,
      };
    }

    const doc = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("name email username role status permissions access clientId");
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin can reset/update password and PIN for any user
router.put("/admin/:id/credentials", authenticate, isAdmin, async (req, res) => {
  try {
    const { password, pin } = req.body || {};
    const user = await User.findById(req.params.id).lean(false);
    if (!user) return res.status(404).json({ error: "User not found" });

    const update = {};
    if (password) {
      const np = String(password);
      if (np.length < 4) return res.status(400).json({ error: "Weak password" });
      update.passwordHash = await bcrypt.hash(np, 10);
    }

    if (pin) {
      const p = String(pin).trim();
      if (!/^\d{4,8}$/.test(p)) return res.status(400).json({ error: "PIN must be 4-8 digits" });
      update.pinHash = await bcrypt.hash(p, 10);
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    Object.assign(user, update);
    await user.save();

    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin can delete any user
router.delete("/admin/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Prevent deleting yourself
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Remove avatar file if it exists
    if (user.avatar && user.avatar.startsWith("/uploads/")) {
      try {
        const filePath = path.join(uploadDir, path.basename(user.avatar));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error("Failed to delete avatar file:", err);
      }
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// User lookup for messaging (backed by Employees)
router.get("/", authenticate, async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const limitRaw = Number(req.query.limit || 20);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20;

    const role = String(req.user?.role || "").toLowerCase();
    const allowedRoles = (() => {
      if (role === "admin") return new Set(["admin", "staff", "marketer"]);
      if (role === "staff") return new Set(["admin", "staff", "marketer"]);
      if (role === "marketer") return new Set(["admin", "staff", "marketer"]);
      return new Set();
    })();

    if (!allowedRoles.size) {
      return res.status(403).json({ error: "Access denied" });
    }

    const empFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const employees = await Employee.find(empFilter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Ensure each employee has a corresponding User record (by email) so conversations use valid User ids.
    const out = [];
    for (const emp of employees) {
      const email = String(emp?.email || "").toLowerCase().trim();
      if (!email) continue;

      // eslint-disable-next-line no-await-in-loop
      const user = await User.findOneAndUpdate(
        { email },
        {
          $setOnInsert: {
            email,
            username: email,
            role: "staff",
            status: "active",
            createdBy: "employee-sync",
          },
          $set: {
            name: emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
            avatar: emp.avatar || "",
          },
        },
        { new: true, upsert: true }
      ).lean();

      const uRole = String(user?.role || "").toLowerCase();
      if (!allowedRoles.has(uRole)) continue;
      out.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: normalizeAvatar(user.avatar),
        role: user.role,
      });
    }

    // Also include admins (not necessarily employees)
    const adminSearch = search ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] } : {};
    if (allowedRoles.has("admin")) {
      const admins = await User.find({ role: "admin", status: "active", ...adminSearch })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("_id name email avatar role")
        .lean();
      for (const a of admins) {
        if (!out.some((x) => String(x._id) === String(a._id))) {
          out.push(a);
        }
      }
    }

    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/me/avatar", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Remove avatar file if it exists
    if (user.avatar && user.avatar.startsWith("/uploads/")) {
      try {
        // Join within known uploads directory and strip any nested paths to avoid traversal
        const filePath = path.join(uploadDir, path.basename(user.avatar));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error("Failed to delete avatar file:", err);
      }
    }
    
    // Update user record to remove avatar
    await User.findByIdAndUpdate(req.user._id, { avatar: "" });
    
    // Also update related records
    const role = String(user?.role || "").toLowerCase();
    const email = String(user?.email || "").toLowerCase().trim();
    
    if (role === "client" && user?.clientId) {
      await Client.updateOne({ _id: user.clientId }, { $set: { avatar: "" } }).catch(() => null);
    }
    
    if (role === "staff" && email) {
      await Employee.updateOne({ email }, { $set: { avatar: "" } }).catch(() => null);
    }
    
    res.json({ message: "Avatar removed successfully" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/fix-avatars", authenticate, async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    
    const users = await User.find({ avatar: { $exists: true, $ne: "" } }).lean();
    let fixedCount = 0;
    
    for (const user of users) {
      if (user.avatar && user.avatar.startsWith("/uploads/")) {
        const filePath = path.join(__dirname, "../../..", user.avatar);
        if (!fs.existsSync(filePath)) {
          // Avatar file doesn't exist, clear the reference
          await User.updateOne({ _id: user._id }, { $set: { avatar: "" } });
          
          // Also update related records
          const role = String(user?.role || "").toLowerCase();
          const email = String(user?.email || "").toLowerCase().trim();
          
          if (role === "client" && user?.clientId) {
            await Client.updateOne({ _id: user.clientId }, { $set: { avatar: "" } }).catch(() => null);
          }
          
          if (role === "staff" && email) {
            await Employee.updateOne({ email }, { $set: { avatar: "" } }).catch(() => null);
          }
          
          fixedCount++;
        }
      }
    }
    
    res.json({ message: `Fixed ${fixedCount} missing avatar references` });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
