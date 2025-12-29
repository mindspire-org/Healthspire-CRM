import { Router } from "express";
import JournalEntry from "../models/JournalEntry.js";
import Account from "../models/Account.js";

const router = Router();

const parseDate = (s) => (s ? new Date(s) : null);

// Utility: summarize by account with optional date filter
async function summarizeByAccount({ from, to, asOf }) {
  const match = {};
  if (from || to) match.date = {};
  if (from) match.date.$gte = from;
  if (to) match.date.$lte = to;
  if (asOf) match.date = { $lte: asOf };

  const pipeline = [
    { $match: match },
    { $unwind: "$lines" },
    {
      $group: {
        _id: "$lines.accountCode",
        debit: { $sum: "$lines.debit" },
        credit: { $sum: "$lines.credit" },
      },
    },
  ];
  const rows = await JournalEntry.aggregate(pipeline);

  // Attach account meta (type, name)
  const byCode = new Map(rows.map((r) => [r._id, r]));
  const codes = rows.map((r) => r._id);
  const accounts = await Account.find(codes.length ? { code: { $in: codes } } : {}).lean();
  const out = rows.map((r) => {
    const acc = accounts.find((a) => a.code === r._id) || {};
    return {
      accountCode: r._id,
      accountName: acc.name || r._id,
      type: acc.type || "other",
      debit: Number(r.debit || 0),
      credit: Number(r.credit || 0),
    };
  });
  return out;
}

// GET /api/reports/trial-balance?from=&to=
router.get("/trial-balance", async (req, res) => {
  try {
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);
    const rows = await summarizeByAccount({ from, to });
    // Totals should balance
    const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
    const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
    res.json({ rows, totalDebit, totalCredit, balanced: Math.round((totalDebit - totalCredit) * 100) === 0 });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/reports/income-statement?from=&to=
router.get("/income-statement", async (req, res) => {
  try {
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);
    const rows = await summarizeByAccount({ from, to });
    const income = rows.filter((r) => r.type === "revenue");
    const expense = rows.filter((r) => r.type === "expense");
    const totalRevenue = income.reduce((s, r) => s + (r.credit - r.debit), 0);
    const totalExpense = expense.reduce((s, r) => s + (r.debit - r.credit), 0);
    const netIncome = totalRevenue - totalExpense;
    res.json({ totalRevenue, totalExpense, netIncome, income, expense });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/reports/balance-sheet?asOf=
router.get("/balance-sheet", async (req, res) => {
  try {
    const asOf = parseDate(req.query.asOf || new Date().toISOString());
    const rows = await summarizeByAccount({ asOf });
    const assets = rows.filter((r) => r.type === "asset");
    const liabilities = rows.filter((r) => r.type === "liability");
    const equity = rows.filter((r) => r.type === "equity");

    const sumBalance = (rs, sign = 1) => rs.reduce((s, r) => s + sign * (Number(r.debit || 0) - Number(r.credit || 0)), 0);

    const totalAssets = sumBalance(assets, +1);
    const totalLiabilities = -sumBalance(liabilities, +1); // liabilities normally credit balance
    const totalEquity = -sumBalance(equity, +1); // equity normally credit balance

    res.json({
      asOf,
      totals: { assets: totalAssets, liabilities: totalLiabilities, equity: totalEquity },
      assets,
      liabilities,
      equity,
      // Basic check: A = L + E (differences likely come from retained earnings via P&L outside this simple snapshot)
      balanced: Math.round((totalAssets - (totalLiabilities + totalEquity)) * 100) === 0,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
