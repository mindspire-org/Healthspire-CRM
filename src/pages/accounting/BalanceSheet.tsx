import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="p-4 space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-600/10 via-sky-500/5 to-emerald-500/10">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.20),transparent_35%),radial-gradient(circle_at_60%_90%,rgba(34,197,94,0.16),transparent_45%)]" />
        <div className="relative p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Accounting</div>
            <div className="text-2xl font-semibold tracking-tight">Balance Sheet</div>
            <div className="text-sm text-muted-foreground">Assets, liabilities and equity snapshot.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {data ? (
              <Badge variant={data?.balanced ? "success" : "destructive"}>
                {data?.balanced ? "Balanced" : "Not balanced"}
              </Badge>
            ) : (
              <Badge variant="secondary">Not loaded</Badge>
            )}
            <Badge variant="secondary">A {Number(totals.assets||0).toFixed(2)}</Badge>
            <Badge variant="secondary">L {Number(totals.liabilities||0).toFixed(2)}</Badge>
            <Badge variant="secondary">E {Number(totals.equity||0).toFixed(2)}</Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div>
              <Label>As of</Label>
              <Input type="date" value={asOf} onChange={(e)=>setAsOf(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={load} disabled={busy} className="w-full">Load</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!data ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Choose an as-of date and click Load to view the balance sheet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assets</CardTitle>
            </CardHeader>
            <CardContent>
              {renderSection("", data?.assets, (r)=> Number(r.debit||0) - Number(r.credit||0))}
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                {renderSection("", data?.liabilities, (r)=> Number(r.credit||0) - Number(r.debit||0))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Equity</CardTitle>
              </CardHeader>
              <CardContent>
                {renderSection("", data?.equity, (r)=> Number(r.credit||0) - Number(r.debit||0))}
                {typeof data?.retainedEarnings === "number" && (
                  <div className="flex justify-between text-sm mt-3 border-t pt-3 font-medium">
                    <span>Retained Earnings</span>
                    <span>{Number(data.retainedEarnings||0).toFixed(2)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
