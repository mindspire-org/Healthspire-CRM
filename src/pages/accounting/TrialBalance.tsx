import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthHeaders } from "@/lib/api/auth";
import { API_BASE } from "@/lib/api/base";

export default function TrialBalance() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [totals, setTotals] = useState<{debit:number;credit:number;balanced:boolean}>({debit:0,credit:0,balanced:true});
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const sp = new URLSearchParams();
      if (from) sp.set("from", from);
      if (to) sp.set("to", to);
      const res = await fetch(`${API_BASE}/api/reports/trial-balance?${sp.toString()}` , { headers: { ...getAuthHeaders() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setRows(Array.isArray(json?.rows) ? json.rows : []);
      setTotals({ debit: Number(json?.totalDebit||0), credit: Number(json?.totalCredit||0), balanced: Boolean(json?.balanced) });
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance</CardTitle>
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

          <div className="overflow-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">Account</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2 text-right">Debit</th>
                  <th className="py-2 pr-2 text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r:any, i:number)=> (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1 pr-2">{r.accountCode} · {r.accountName}</td>
                    <td className="py-1 pr-2">{r.type}</td>
                    <td className="py-1 pr-2 text-right">{Number(r.debit||0).toFixed(2)}</td>
                    <td className="py-1 pr-2 text-right">{Number(r.credit||0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="py-2 pr-2 text-right font-medium">Totals</td>
                  <td className="py-2 pr-2 text-right font-medium">{totals.debit.toFixed(2)}</td>
                  <td className="py-2 pr-2 text-right font-medium">{totals.credit.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="text-sm text-muted-foreground">{totals.balanced ? "Balanced" : "Not balanced"}</div>
        </CardContent>
      </Card>
    </div>
  );
}
