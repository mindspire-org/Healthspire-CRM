import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { API_BASE } from "@/lib/api/base";
import { getAuthHeaders } from "@/lib/api/auth";

type LeadDoc = {
  _id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  ownerId?: string;
  status?: string;
  source?: string;
  value?: string;
  currency?: string;
  currencySymbol?: string;
  createdAt?: string;
};

type Employee = { _id: string; name?: string; firstName?: string; lastName?: string };

const STATUS_ORDER = ["New", "Qualified", "Discussion", "Negotiation", "Won", "Lost"] as const;

const safeNumber = (v: any) => {
  if (v === null || v === undefined) return 0;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const fmtMoney = (n: number, symbol?: string) => {
  const s = symbol || "Rs.";
  try {
    return `${s}${Math.round(n).toLocaleString()}`;
  } catch {
    return `${s}${Math.round(n)}`;
  }
};

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "-";
  }
};

function Kpi({ title, value, meta, tone }: { title: string; value: string; meta?: string; tone: string }) {
  return (
    <Card className={"border bg-gradient-to-br " + tone}>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
        {meta ? <div className="mt-1 text-xs text-muted-foreground">{meta}</div> : null}
      </CardContent>
    </Card>
  );
}

export default function CrmDashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState<LeadDoc[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const employeeNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of employees) {
      const name = (e.name || `${e.firstName || ""} ${e.lastName || ""}`.trim() || "-").trim();
      if (e._id) m.set(String(e._id), name);
    }
    return m;
  }, [employees]);

  const loadEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/employees`, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json().catch(() => []);
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      setEmployees([]);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      const q = search.trim();
      if (q) params.set("q", q);
      const url = `${API_BASE}/api/leads${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json().catch(() => []);
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load leads");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      load();
    }, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const stats = useMemo(() => {
    const byStatus: Record<string, { count: number; value: number }> = {};
    for (const s of STATUS_ORDER) byStatus[s] = { count: 0, value: 0 };

    let expected = 0;
    let won = 0;
    let lost = 0;
    let total = 0;

    for (const l of items) {
      total += 1;
      const status = String(l.status || "New");
      const v = safeNumber(l.value);
      if (!byStatus[status]) byStatus[status] = { count: 0, value: 0 };
      byStatus[status].count += 1;
      byStatus[status].value += v;

      if (status === "Won") won += v;
      else if (status === "Lost") lost += v;
      else expected += v;
    }

    const symbol =
      items.find((x) => x.currencySymbol)?.currencySymbol ||
      items.find((x) => x.currency === "USD")?.currencySymbol ||
      "Rs.";

    return { total, expected, won, lost, byStatus, symbol };
  }, [items]);

  const latest = useMemo(() => {
    return [...items]
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })
      .slice(0, 8);
  }, [items]);

  const insights = useMemo(() => {
    const now = Date.now();
    const periods = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    } as const;

    const parseTs = (iso?: string) => {
      if (!iso) return 0;
      const t = new Date(iso).getTime();
      return Number.isFinite(t) ? t : 0;
    };

    const aggTop = (rows: LeadDoc[], key: (l: LeadDoc) => string, filter?: (l: LeadDoc) => boolean) => {
      const m = new Map<string, { count: number; value: number }>();
      for (const l of rows) {
        if (filter && !filter(l)) continue;
        const k = String(key(l) || "-").trim() || "-";
        const cur = m.get(k) || { count: 0, value: 0 };
        cur.count += 1;
        cur.value += safeNumber(l.value);
        m.set(k, cur);
      }
      let topKey = "-";
      let top = { count: 0, value: 0 };
      for (const [k, v] of m.entries()) {
        if (v.value > top.value || (v.value === top.value && v.count > top.count)) {
          topKey = k;
          top = v;
        }
      }
      return { key: topKey, ...top };
    };

    const sliceBy = (ms: number) => {
      const from = now - ms;
      return items.filter((l) => {
        const ts = parseTs(l.createdAt);
        return ts >= from;
      });
    };

    const mk = (label: string, ms: number) => {
      const rows = sliceBy(ms);
      const topSales = aggTop(
        rows,
        (l) => (l.ownerId ? String(l.ownerId) : "Unassigned"),
        (l) => String(l.status || "").toLowerCase() === "won"
      );
      const topLeadSource = aggTop(rows, (l) => (l.source ? String(l.source) : "-") );
      const topSaleSource = aggTop(rows, (l) => (l.source ? String(l.source) : "-") , (l) => String(l.status || "").toLowerCase() === "won");
      return { label, topSales, topLeadSource, topSaleSource };
    };

    const summary = {
      week: mk("This week", periods.week),
      month: mk("This month", periods.month),
      year: mk("This year", periods.year),
    };

    return summary;
  }, [items]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 p-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-white/80 text-xs uppercase tracking-wide">CRM</div>
            <div className="text-3xl font-semibold">Leads Dashboard</div>
            <div className="mt-1 text-white/80 text-sm">Pipeline health, expected sales, and latest activity</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={() => navigate("/crm/leads")}>
              Open leads
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white/10 border border-white/15 p-4">
            <div className="text-xs text-white/70">Expected sales</div>
            <div className="text-2xl font-semibold">{fmtMoney(stats.expected, stats.symbol)}</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-4">
            <div className="text-xs text-white/70">Won</div>
            <div className="text-2xl font-semibold">{fmtMoney(stats.won, stats.symbol)}</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-4">
            <div className="text-xs text-white/70">Lost</div>
            <div className="text-2xl font-semibold">{fmtMoney(stats.lost, stats.symbol)}</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-4">
            <div className="text-xs text-white/70">Total leads</div>
            <div className="text-2xl font-semibold">{stats.total}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Top sales person</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Period</TableHead>
                    <TableHead>Sales person</TableHead>
                    <TableHead className="text-right">Won</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(["week", "month", "year"] as const).map((k) => {
                    const row = insights[k];
                    const id = row.topSales.key;
                    const name = id === "Unassigned" ? "Unassigned" : (employeeNameById.get(String(id)) || "-");
                    return (
                      <TableRow key={k}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{row.label}</TableCell>
                        <TableCell className="whitespace-nowrap">{name}</TableCell>
                        <TableCell className="text-right">{row.topSales.count}</TableCell>
                        <TableCell className="text-right">{fmtMoney(row.topSales.value, stats.symbol)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Latest leads</CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64" />
                  <Button variant="outline" onClick={load} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latest.length ? (
                    latest.map((l) => (
                      <TableRow key={l._id}>
                        <TableCell className="whitespace-nowrap">
                          <button type="button" className="text-primary underline" onClick={() => navigate(`/crm/leads/${l._id}`)}>
                            {l.name}
                          </button>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant={l.status === "Won" ? "success" : l.status === "Lost" ? "destructive" : "secondary" as any}>
                            {l.status || "New"}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{fmtMoney(safeNumber(l.value), l.currencySymbol || stats.symbol)}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{l.source || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(l.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {loading ? "Loading..." : "No leads"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Top sources</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Period</TableHead>
                    <TableHead>Top lead source</TableHead>
                    <TableHead>Top sales source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(["week", "month", "year"] as const).map((k) => {
                    const row = insights[k];
                    return (
                      <TableRow key={k}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{row.label}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.topLeadSource.key}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.topSaleSource.key}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Kpi
            title="New"
            value={String(stats.byStatus["New"]?.count || 0)}
            meta={fmtMoney(stats.byStatus["New"]?.value || 0, stats.symbol)}
            tone="from-white to-slate-50 dark:from-slate-900 dark:to-slate-900"
          />
          <Kpi
            title="Qualified"
            value={String(stats.byStatus["Qualified"]?.count || 0)}
            meta={fmtMoney(stats.byStatus["Qualified"]?.value || 0, stats.symbol)}
            tone="from-white to-emerald-50 dark:from-slate-900 dark:to-slate-900"
          />
          <Kpi
            title="Discussion"
            value={String(stats.byStatus["Discussion"]?.count || 0)}
            meta={fmtMoney(stats.byStatus["Discussion"]?.value || 0, stats.symbol)}
            tone="from-white to-sky-50 dark:from-slate-900 dark:to-slate-900"
          />
          <Kpi
            title="Negotiation"
            value={String(stats.byStatus["Negotiation"]?.count || 0)}
            meta={fmtMoney(stats.byStatus["Negotiation"]?.value || 0, stats.symbol)}
            tone="from-white to-amber-50 dark:from-slate-900 dark:to-slate-900"
          />
          <Kpi
            title="Won"
            value={String(stats.byStatus["Won"]?.count || 0)}
            meta={fmtMoney(stats.byStatus["Won"]?.value || 0, stats.symbol)}
            tone="from-white to-green-50 dark:from-slate-900 dark:to-slate-900"
          />
          <Kpi
            title="Lost"
            value={String(stats.byStatus["Lost"]?.count || 0)}
            meta={fmtMoney(stats.byStatus["Lost"]?.value || 0, stats.symbol)}
            tone="from-white to-rose-50 dark:from-slate-900 dark:to-slate-900"
          />
        </div>
      </div>
    </div>
  );
}
