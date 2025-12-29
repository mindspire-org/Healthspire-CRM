import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthHeaders } from "@/lib/api/auth";
import { API_BASE } from "@/lib/api/base";

export default function GeneralLedger() {
  const [accountCode, setAccountCode] = useState("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [account, setAccount] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!accountCode) return;
    setBusy(true);
    try {
      const sp = new URLSearchParams();
      if (from) sp.set("from", from);
      if (to) sp.set("to", to);
      sp.set("accountCode", accountCode);
      const res = await fetch(`${API_BASE}/api/ledgers/general?${sp.toString()}`, {
        headers: { ...getAuthHeaders() },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setAccount(json?.account || null);
      setRows(Array.isArray(json?.rows) ? json.rows : []);
    } catch (e) {
      // ignore for now; could use toast
    } finally {
      setBusy(false);
    }
  };

  const totals = rows.reduce(
    (acc, r) => {
      acc.debit += Number(r.debit || 0);
      acc.credit += Number(r.credit || 0);
      return acc;
    },
    { debit: 0, credit: 0 }
  );

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>General Ledger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <Label>Account Code</Label>
              <Input value={accountCode} onChange={(e) => setAccountCode(e.target.value)} placeholder="e.g. 1000" />
            </div>
            <div>
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={load} disabled={!accountCode || busy}>Load</Button>
            </div>
          </div>

          {account && (
            <div className="text-sm text-muted-foreground">{account.code} · {account.name}</div>
          )}

          <div className="overflow-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 pr-2">Ref</th>
                  <th className="py-2 pr-2">Memo</th>
                  <th className="py-2 pr-2 text-right">Debit</th>
                  <th className="py-2 pr-2 text-right">Credit</th>
                  <th className="py-2 pr-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1 pr-2">{String(r.date).slice(0,10)}</td>
                    <td className="py-1 pr-2">{r.refNo || ""}</td>
                    <td className="py-1 pr-2">{r.memo || ""}</td>
                    <td className="py-1 pr-2 text-right">{Number(r.debit||0).toFixed(2)}</td>
                    <td className="py-1 pr-2 text-right">{Number(r.credit||0).toFixed(2)}</td>
                    <td className="py-1 pr-2 text-right">{Number(r.balance||0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}></td>
                  <td className="py-2 pr-2 text-right font-medium">{totals.debit.toFixed(2)}</td>
                  <td className="py-2 pr-2 text-right font-medium">{totals.credit.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
