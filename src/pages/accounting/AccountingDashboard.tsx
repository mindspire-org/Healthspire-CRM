import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getAuthHeaders } from "@/lib/api/auth";
import { API_BASE } from "@/lib/api/base";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import {
  BookOpen,
  Scale,
  Landmark,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Star,
  Sparkles,
  Target,
  BarChart3,
  LineChart as LineChartIcon,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Download,
  Share2,
} from "lucide-react";

type TrialBalanceRow = {
  accountCode: string;
  accountName: string;
  type: string;
  debit: number;
  credit: number;
};

type TrialBalanceResponse = {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
};

type IncomeStatementResponse = {
  totalRevenue: number;
  totalExpense: number;
  netIncome: number;
};

type BalanceSheetResponse = {
  totals: {
    assets: number;
    liabilities: number;
    equity: number;
    retainedEarnings?: number;
  };
  balanced?: boolean;
};

type JournalEntry = {
  _id?: string;
  date?: string;
  memo?: string;
  refNo?: string;
  currency?: string;
  postedBy?: string;
  lines?: Array<{ accountCode?: string; debit?: number; credit?: number }>;
};

type Account = {
  _id?: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  isActive?: boolean;
};

type EntityType = "vendor" | "client" | "employee";
type EntityHit = {
  entityType: EntityType;
  entityId: string;
  label: string;
  meta?: string;
};

type EntityLedgerRow = {
  date?: string;
  refNo?: string;
  memo?: string;
  accountCode?: string;
  debit?: number;
  credit?: number;
  balance?: number;
};

const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

const formatMoney = (n: number) => {
  const v = Number(n || 0);
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function AccountingDashboard() {
  const [loading, setLoading] = useState(true);
  const [trial, setTrial] = useState<TrialBalanceResponse | null>(null);
  const [income, setIncome] = useState<IncomeStatementResponse | null>(null);
  const [balance, setBalance] = useState<BalanceSheetResponse | null>(null);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [entityQuery, setEntityQuery] = useState("");
  const [entityBusy, setEntityBusy] = useState(false);
  const [entityHits, setEntityHits] = useState<EntityHit[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityHit | null>(null);
  const [entityFrom, setEntityFrom] = useState<string>("");
  const [entityTo, setEntityTo] = useState<string>("");
  const [entityLedgerBusy, setEntityLedgerBusy] = useState(false);
  const [entityLedgerRows, setEntityLedgerRows] = useState<EntityLedgerRow[]>([]);
  const [entityLedgerError, setEntityLedgerError] = useState<string>("");

  const today = useMemo(() => new Date(), []);
  const from30 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);

  const searchEntities = async (qRaw: string) => {
    const q = String(qRaw || "").trim();
    setEntityHits([]);
    setSelectedEntity(null);
    setEntityLedgerRows([]);
    setEntityLedgerError("");
    if (!q) return;

    setEntityBusy(true);
    try {
      const sp = new URLSearchParams();
      sp.set("q", q);
      const headers = { ...getAuthHeaders() };

      const [vRes, cRes, eRes] = await Promise.all([
        fetch(`${API_BASE}/api/vendors?${sp.toString()}`, { headers }),
        fetch(`${API_BASE}/api/clients?${sp.toString()}`, { headers }),
        fetch(`${API_BASE}/api/employees?${sp.toString()}`, { headers }),
      ]);

      const vJson = await vRes.json().catch(() => []);
      const cJson = await cRes.json().catch(() => []);
      const eJson = await eRes.json().catch(() => []);

      const vendors: EntityHit[] = (Array.isArray(vJson) ? vJson : []).slice(0, 20).map((v: any) => ({
        entityType: "vendor",
        entityId: String(v._id),
        label: String(v.name || v.company || "Vendor"),
        meta: String(v.company || v.email || ""),
      }));

      const clients: EntityHit[] = (Array.isArray(cJson) ? cJson : []).slice(0, 20).map((c: any) => ({
        entityType: "client",
        entityId: String(c._id),
        label: String(c.company || c.person || c.email || "Client"),
        meta: String(c.email || c.phone || ""),
      }));

      const employees: EntityHit[] = (Array.isArray(eJson) ? eJson : []).slice(0, 20).map((e: any) => ({
        entityType: "employee",
        entityId: String(e._id),
        label: String(e.name || e.email || "Employee"),
        meta: String(e.email || e.department || ""),
      }));

      const merged = [...vendors, ...clients, ...employees].slice(0, 30);
      setEntityHits(merged);
    } finally {
      setEntityBusy(false);
    }
  };

  const loadEntityLedger = async (ent: EntityHit) => {
    setSelectedEntity(ent);
    setEntityLedgerRows([]);
    setEntityLedgerError("");
    setEntityLedgerBusy(true);
    try {
      const sp = new URLSearchParams();
      sp.set("entityType", ent.entityType);
      sp.set("entityId", ent.entityId);
      if (entityFrom) sp.set("from", entityFrom);
      if (entityTo) sp.set("to", entityTo);
      const res = await fetch(`${API_BASE}/api/ledgers/entity?${sp.toString()}`, { headers: { ...getAuthHeaders() } });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load entity ledger");
      setEntityLedgerRows(Array.isArray(json?.rows) ? json.rows : []);
    } catch (e: any) {
      setEntityLedgerError(String(e?.message || "Failed"));
    } finally {
      setEntityLedgerBusy(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const from = toDateStr(from30);
      const to = toDateStr(today);
      const asOf = to;

      const [trialRes, incomeRes, balRes, journalsRes, accountsRes] = await Promise.all([
        fetch(`${API_BASE}/api/reports/trial-balance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
          headers: { ...getAuthHeaders() },
        }),
        fetch(`${API_BASE}/api/reports/income-statement?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
          headers: { ...getAuthHeaders() },
        }),
        fetch(`${API_BASE}/api/reports/balance-sheet?asOf=${encodeURIComponent(asOf)}`, {
          headers: { ...getAuthHeaders() },
        }),
        fetch(`${API_BASE}/api/journals?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
          headers: { ...getAuthHeaders() },
        }),
        fetch(`${API_BASE}/api/accounts`, {
          headers: { ...getAuthHeaders() },
        }),
      ]);

      const trialJson = (await trialRes.json().catch(() => null)) as TrialBalanceResponse | null;
      if (trialRes.ok) setTrial(trialJson);

      const incomeJson = (await incomeRes.json().catch(() => null)) as IncomeStatementResponse | null;
      if (incomeRes.ok) setIncome(incomeJson);

      const balJson = (await balRes.json().catch(() => null)) as BalanceSheetResponse | null;
      if (balRes.ok) setBalance(balJson);

      const journalsJson = (await journalsRes.json().catch(() => null)) as any;
      if (journalsRes.ok) setJournals(Array.isArray(journalsJson) ? journalsJson : []);

      const accountsJson = (await accountsRes.json().catch(() => null)) as any;
      if (accountsRes.ok) setAccounts(Array.isArray(accountsJson) ? accountsJson : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = useMemo(() => {
    const totalRevenue = Number(income?.totalRevenue || 0);
    const totalExpense = Number(income?.totalExpense || 0);
    const netIncome = Number(income?.netIncome || 0);

    const assets = Number(balance?.totals?.assets || 0);
    const liabilities = Number(balance?.totals?.liabilities || 0);
    const equity = Number(balance?.totals?.equity || 0);
    const retained = Number(balance?.totals?.retainedEarnings || 0);

    const balanced = Boolean(trial?.balanced);
    const voucherCount = journals.length;

    return { totalRevenue, totalExpense, netIncome, assets, liabilities, equity, retained, balanced, voucherCount };
  }, [income, balance, trial, journals.length]);

  const accountTypeData = useMemo(() => {
    const types = ["asset", "liability", "equity", "revenue", "expense"] as const;
    const mapped = types.map((t) => ({
      name: t,
      value: accounts.filter((a) => a.type === t).length,
    }));
    return mapped;
  }, [accounts]);

  const topAccounts = useMemo(() => {
    const rows = Array.isArray(trial?.rows) ? trial!.rows : [];
    const scored = rows
      .map((r) => {
        const movement = Math.abs(Number(r.debit || 0) - Number(r.credit || 0));
        return { ...r, movement };
      })
      .sort((a, b) => b.movement - a.movement)
      .slice(0, 8)
      .map((r) => ({
        name: `${r.accountCode} ${r.accountName}`,
        movement: Number(r.movement || 0),
      }));
    return scored;
  }, [trial]);

  const recentJournals = useMemo(() => {
    return [...journals]
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
      .slice(0, 6);
  }, [journals]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Hero Header with Animated Background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, animation: 'pulse 3s ease-in-out infinite'}} />
        <div className="relative px-6 py-12 sm:px-12 lg:px-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Accounting Dashboard
                  </h1>
                  <p className="mt-2 text-lg text-white/80">
                    Financial overview and intelligent insights
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Real-time Analytics
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Target className="w-3 h-3 mr-1" />
                  Smart Insights
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant Reports
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                <Link to="/accounting/journal">
                  <BookOpen className="w-4 h-4 mr-2" />
                  New Voucher
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                <Link to="/accounting/trial-balance">
                  <Scale className="w-4 h-4 mr-2" />
                  Trial Balance
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-white/90">
                <Link to="/accounting/balance-sheet">
                  <Landmark className="w-4 h-4 mr-2" />
                  Balance Sheet
                </Link>
              </Button>
              <Button onClick={load} variant="outline" size="lg" disabled={loading} className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-12 lg:px-16 space-y-8">
        {/* Entity Ledger Lookup Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <Card className="xl:col-span-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                Entity Ledger Lookup
                <Badge className="ml-auto bg-indigo-100 text-indigo-800">Universal Search</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-7">
                  <Label className="text-sm font-medium">Search entity (vendor / client / employee)</Label>
                  <Input
                    value={entityQuery}
                    onChange={(e) => setEntityQuery(e.target.value)}
                    placeholder="Type name, email, company..."
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">From</Label>
                  <Input type="date" value={entityFrom} onChange={(e) => setEntityFrom(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">To</Label>
                  <Input type="date" value={entityTo} onChange={(e) => setEntityTo(e.target.value)} />
                </div>
                <div className="md:col-span-1 flex md:justify-end gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => searchEntities(entityQuery)}
                    disabled={!entityQuery.trim() || entityBusy}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  {entityBusy ? "Searching…" : entityHits.length ? `Found ${entityHits.length} matches` : ""}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => searchEntities(entityQuery)}
                    disabled={!entityQuery.trim() || entityBusy}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEntityQuery("");
                      setEntityHits([]);
                      setSelectedEntity(null);
                      setEntityLedgerRows([]);
                      setEntityLedgerError("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="overflow-hidden rounded-lg border border-border/50">
                <div className="max-h-[420px] overflow-auto">
                  <table className="min-w-[860px] w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                      <tr className="text-left">
                        <th className="py-3 px-4 font-medium">Type</th>
                        <th className="py-3 px-4 font-medium">Entity</th>
                        <th className="py-3 px-4 font-medium">Meta</th>
                        <th className="py-3 px-4 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entityHits.map((h) => (
                        <tr key={`${h.entityType}:${h.entityId}`} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge variant="secondary" className="capitalize">{h.entityType}</Badge>
                          </td>
                          <td className="py-3 px-4 font-medium">{h.label}</td>
                          <td className="py-3 px-4 text-muted-foreground">{h.meta || ""}</td>
                          <td className="py-3 px-4 text-right">
                            <Button size="sm" onClick={() => loadEntityLedger(h)} disabled={entityLedgerBusy} className="bg-indigo-600 hover:bg-indigo-700">
                              <Eye className="w-3 h-3 mr-1" />
                              View ledger
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {!entityBusy && entityQuery.trim() && entityHits.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Search className="w-8 h-8" />
                              <span>No matches. Try a different query.</span>
                            </div>
                          </td>
                        </tr>
                      )}
                      {!entityQuery.trim() && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Search className="w-8 h-8" />
                              <span>Search an entity to view its ledger.</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-4 xl:sticky xl:top-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                Ledger Preview
                <Badge className="ml-auto bg-emerald-100 text-emerald-800">Live Data</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedEntity ? (
                <>
                  <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
                    <div className="text-sm font-semibold">{selectedEntity.label}</div>
                    <div className="text-xs text-muted-foreground capitalize">{selectedEntity.entityType} · {selectedEntity.entityId}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={entityLedgerBusy ? "secondary" : "default"} className="bg-emerald-100 text-emerald-800">
                      {entityLedgerBusy ? "Loading…" : `${entityLedgerRows.length} rows`}
                    </Badge>
                  </div>
                  {entityLedgerError && (
                    <div className="text-sm text-destructive p-2 bg-red-50 dark:bg-red-900/20 rounded">{entityLedgerError}</div>
                  )}
                  <div className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    💡 Click "View ledger" on the left to refresh using the current date range.
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Eye className="w-8 h-8" />
                    <span>Select an entity to preview its ledger.</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {selectedEntity && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Ledger Entries
                <Badge className="ml-auto bg-purple-100 text-purple-800">Detailed View</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-border/50">
                <table className="min-w-[920px] w-full text-sm">
                  <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                    <tr className="text-left">
                      <th className="py-3 px-4 font-medium">Date</th>
                      <th className="py-3 px-4 font-medium">Ref</th>
                      <th className="py-3 px-4 font-medium">Account</th>
                      <th className="py-3 px-4 font-medium">Memo</th>
                      <th className="py-3 px-4 text-right font-medium">Debit</th>
                      <th className="py-3 px-4 text-right font-medium">Credit</th>
                      <th className="py-3 px-4 text-right font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entityLedgerRows.map((r, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap font-medium">{String(r.date || "").slice(0, 10)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-mono">{String(r.refNo || "")}</Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{String(r.accountCode || "")}</td>
                        <td className="py-3 px-4 max-w-[200px] truncate">{String(r.memo || "")}</td>
                        <td className="py-3 px-4 text-right font-medium">{Number(r.debit || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-medium">{Number(r.credit || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-medium">{Number(r.balance || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 opacity-50" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}} />
          <CardHeader className="relative pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-100">
              <DollarSign className="w-5 h-5" /> Net Income (30d)
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-3">
            <div className="text-3xl font-bold">{formatMoney(kpis.netIncome)}</div>
            <div className="flex items-center gap-2 text-sm text-emerald-100">
              {kpis.netIncome >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              Revenue {formatMoney(kpis.totalRevenue)} · Expense {formatMoney(kpis.totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 opacity-50" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}} />
          <CardHeader className="relative pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-100">
              <Landmark className="w-5 h-5" /> Assets / Liabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-3">
            <div className="text-3xl font-bold">{formatMoney(kpis.assets)}</div>
            <div className="text-sm text-indigo-100">Liabilities {formatMoney(kpis.liabilities)} · Equity {formatMoney(kpis.equity)}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 opacity-50" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}} />
          <CardHeader className="relative pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-sky-100">
              <Scale className="w-5 h-5" /> Trial Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-3">
            <div className="flex items-center gap-2">
              {loading ? (
                <Badge variant="secondary" className="bg-white/20 text-white">Loading…</Badge>
              ) : kpis.balanced ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">Balanced</Badge>
              ) : (
                <Badge variant="destructive">Not Balanced</Badge>
              )}
              {trial && (
                <div className="text-sm text-sky-100">
                  Dr {formatMoney(Number(trial.totalDebit || 0))} · Cr {formatMoney(Number(trial.totalCredit || 0))}
                </div>
              )}
            </div>
            <div className="text-sm text-sky-100">Retained earnings: {formatMoney(kpis.retained)}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 opacity-50" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}} />
          <CardHeader className="relative pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-fuchsia-100">
              <BookOpen className="w-5 h-5" /> Vouchers (30d)
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-3">
            <div className="text-3xl font-bold">{loading ? "…" : String(kpis.voucherCount)}</div>
            <div className="text-sm text-fuchsia-100">Recent journal entries posted in the last 30 days</div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" /> 
              Top Account Movements (30d)
              <Badge className="ml-auto bg-indigo-100 text-indigo-800">Live Data</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topAccounts} margin={{ left: 12, right: 12 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" hide />
                <YAxis tickFormatter={(v) => Number(v).toFixed(0)} width={60} />
                <Tooltip 
                  formatter={(v) => [formatMoney(Number(v)), "Movement"]} 
                  labelFormatter={() => ""}
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="movement" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="text-xs text-muted-foreground">
                📊 Based on Trial Balance absolute net movement per account (debit vs credit)
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-600" />
              Chart of Accounts
              <Badge className="ml-auto bg-emerald-100 text-emerald-800">Overview</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accountTypeData} margin={{ left: 0, right: 0, top: 10 }}>
                <defs>
                  <linearGradient id="accFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  formatter={(v) => [String(v), "Accounts"]}
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#accFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Recent Vouchers
              <Badge className="ml-auto bg-purple-100 text-purple-800">Last 30 Days</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-border/50">
              <table className="min-w-[720px] w-full text-sm">
                <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                  <tr className="text-left">
                    <th className="py-3 px-4 font-medium">Date</th>
                    <th className="py-3 px-4 font-medium">Ref</th>
                    <th className="py-3 px-4 font-medium">Memo</th>
                    <th className="py-3 px-4 font-medium">Posted By</th>
                    <th className="py-3 px-4 text-right font-medium">Lines</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJournals.map((j, idx) => (
                    <tr key={String(j._id)} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-medium">{String(j.date || "").slice(0, 10)}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-mono">{j.refNo || "N/A"}</Badge>
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate">{j.memo || "No memo"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{j.postedBy || "System"}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="secondary">{Array.isArray(j.lines) ? j.lines.length : 0}</Badge>
                      </td>
                    </tr>
                  ))}
                  {!loading && recentJournals.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <BookOpen className="w-8 h-8" />
                          <span>No vouchers found in the last 30 days</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              Quick Actions
              <Badge className="ml-auto bg-amber-100 text-amber-800">Tools</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-between h-12 border-2 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
              <Link to="/accounting/journal">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg dark:bg-indigo-900/30">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Post Journal Entry</div>
                    <div className="text-xs text-muted-foreground">Create new voucher</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between h-12 border-2 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
              <Link to="/accounting/ledger">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg dark:bg-emerald-900/30">
                    <Layers className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">General Ledger</div>
                    <div className="text-xs text-muted-foreground">View all accounts</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between h-12 border-2 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20">
              <Link to="/accounting/accounts">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                    <Scale className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Chart of Accounts</div>
                    <div className="text-xs text-muted-foreground">Manage accounts</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between h-12 border-2 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20">
              <Link to="/accounting/vendors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg dark:bg-rose-900/30">
                    <Wallet className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Vendors & Payables</div>
                    <div className="text-xs text-muted-foreground">Manage suppliers</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
