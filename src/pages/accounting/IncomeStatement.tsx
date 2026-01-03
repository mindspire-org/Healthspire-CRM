import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAuthHeaders } from "@/lib/api/auth";
import { API_BASE } from "@/lib/api/base";

export default function IncomeStatement() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [data, setData] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const sp = new URLSearchParams();
      if (from) sp.set("from", from);
      if (to) sp.set("to", to);
      const res = await fetch(`${API_BASE}/api/reports/income-statement?${sp.toString()}`, { headers: { ...getAuthHeaders() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setData(json);
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  const income = Array.isArray(data?.income) ? data.income : [];
  const expense = Array.isArray(data?.expense) ? data.expense : [];
  const net = Number(data?.netIncome || 0);

  return (
    <div className="p-4 space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-600/10 via-sky-500/5 to-emerald-500/10">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.20),transparent_35%),radial-gradient(circle_at_60%_90%,rgba(34,197,94,0.16),transparent_45%)]" />
        <div className="relative p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Accounting</div>
            <div className="text-2xl font-semibold tracking-tight">Income Statement</div>
            <div className="text-sm text-muted-foreground">Track revenue, expenses and net income for a period.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={busy ? "secondary" : net >= 0 ? "success" : "destructive"}>
              {busy ? "Loading…" : net >= 0 ? "Profit" : "Loss"}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div>
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={load} disabled={busy} className="w-full">Load</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              {income.map((r:any, i:number)=> (
                <div key={i} className="flex justify-between text-sm">
                  <span className="truncate">{r.accountCode} · {r.accountName}</span>
                  <span className="font-medium">{(Number(r.credit||0) - Number(r.debit||0)).toFixed(2)}</span>
                </div>
              ))}
              {!busy && income.length === 0 && (
                <div className="text-sm text-muted-foreground">No revenue rows.</div>
              )}
            </div>
            <div className="flex justify-between mt-3 border-t pt-3 font-medium">
              <span>Total Revenue</span>
              <span>{Number(data?.totalRevenue||0).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              {expense.map((r:any, i:number)=> (
                <div key={i} className="flex justify-between text-sm">
                  <span className="truncate">{r.accountCode} · {r.accountName}</span>
                  <span className="font-medium">{(Number(r.debit||0) - Number(r.credit||0)).toFixed(2)}</span>
                </div>
              ))}
              {!busy && expense.length === 0 && (
                <div className="text-sm text-muted-foreground">No expense rows.</div>
              )}
            </div>
            <div className="flex justify-between mt-3 border-t pt-3 font-medium">
              <span>Total Expenses</span>
              <span>{Number(data?.totalExpense||0).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-indigo-500/10">
          <CardHeader>
            <CardTitle className="text-base">Net Income</CardTitle>
          </CardHeader>
        </div>
        <CardContent className="py-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Revenue minus expenses for the selected range.</div>
          <div className="text-2xl font-semibold">{net.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
