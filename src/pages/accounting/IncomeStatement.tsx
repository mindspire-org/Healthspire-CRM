import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Income Statement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={load} disabled={busy}>Load</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="font-medium mb-2">Revenue</div>
              <div className="space-y-1">
                {income.map((r:any, i:number)=> (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{r.accountCode} · {r.accountName}</span>
                    <span>{(Number(r.credit||0) - Number(r.debit||0)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 border-t pt-2 font-medium">
                <span>Total Revenue</span>
                <span>{Number(data?.totalRevenue||0).toFixed(2)}</span>
              </div>
            </div>

            <div>
              <div className="font-medium mb-2">Expenses</div>
              <div className="space-y-1">
                {expense.map((r:any, i:number)=> (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{r.accountCode} · {r.accountName}</span>
                    <span>{(Number(r.debit||0) - Number(r.credit||0)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 border-t pt-2 font-medium">
                <span>Total Expenses</span>
                <span>{Number(data?.totalExpense||0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end text-base font-semibold">
            Net Income: {Number(data?.netIncome||0).toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
