import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthHeaders } from "@/lib/api/auth";
import { API_BASE } from "@/lib/api/base";

export default function BalanceSheet() {
  const [asOf, setAsOf] = useState<string>(new Date().toISOString().slice(0,10));
  const [data, setData] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const sp = new URLSearchParams();
      if (asOf) sp.set("asOf", asOf);
      const res = await fetch(`${API_BASE}/api/reports/balance-sheet?${sp.toString()}`, { headers: { ...getAuthHeaders() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setData(json);
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  const renderSection = (title: string, rows: any[] = [], compute: (r:any)=>number) => (
    <div>
      <div className="font-medium mb-2">{title}</div>
      <div className="space-y-1">
        {rows.map((r:any, i:number)=> (
          <div key={i} className="flex justify-between text-sm">
            <span>{r.accountCode} · {r.accountName}</span>
            <span>{compute(r).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const totals = data?.totals || { assets:0, liabilities:0, equity:0 };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>As of</Label>
              <Input type="date" value={asOf} onChange={(e)=>setAsOf(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={load} disabled={busy}>Load</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSection("Assets", data?.assets, (r)=> Number(r.debit||0) - Number(r.credit||0))}
            <div className="space-y-6">
              {renderSection("Liabilities", data?.liabilities, (r)=> Number(r.credit||0) - Number(r.debit||0))}
              {renderSection("Equity", data?.equity, (r)=> Number(r.credit||0) - Number(r.debit||0))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold">
            <div>Total Assets: {Number(totals.assets||0).toFixed(2)}</div>
            <div>Total Liabilities: {Number(totals.liabilities||0).toFixed(2)}</div>
            <div>Total Equity: {Number(totals.equity||0).toFixed(2)}</div>
          </div>
          {data && (
            <div className="text-sm text-muted-foreground">{data.balanced ? "Balanced (A = L + E)" : "Not balanced"}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
