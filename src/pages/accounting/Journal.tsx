import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthHeaders } from "@/lib/api/auth";
import { API_BASE } from "@/lib/api/base";

type Line = {
  accountCode: string;
  debit?: number;
  credit?: number;
  entityType?: string;
  entityId?: string;
  description?: string;
};

export default function Journal() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { accountCode: "", debit: 0, credit: 0 },
    { accountCode: "", debit: 0, credit: 0 },
  ]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");

  const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);

  const updateLine = (idx: number, patch: Partial<Line>) => {
    setLines((cur) => cur.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };
  const addLine = () => setLines((cur) => [...cur, { accountCode: "", debit: 0, credit: 0 }]);
  const removeLine = (idx: number) => setLines((cur) => cur.filter((_, i) => i !== idx));

  const submit = async () => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/journals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ date, memo, lines }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to post journal");
      setMessage("Journal posted.");
      setMemo("");
      setLines([
        { accountCode: "", debit: 0, credit: 0 },
        { accountCode: "", debit: 0, credit: 0 },
      ]);
    } catch (e: any) {
      setMessage(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Journal Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Memo</Label>
              <Input value={memo} onChange={(e) => setMemo(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            {lines.map((l, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end">
                <div className="sm:col-span-2">
                  <Label>Account Code</Label>
                  <Input value={l.accountCode} onChange={(e) => updateLine(idx, { accountCode: e.target.value })} placeholder="e.g. 1000" />
                </div>
                <div>
                  <Label>Debit</Label>
                  <Input type="number" value={l.debit ?? 0} onChange={(e) => updateLine(idx, { debit: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Credit</Label>
                  <Input type="number" value={l.credit ?? 0} onChange={(e) => updateLine(idx, { credit: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Entity Type</Label>
                  <Input value={l.entityType || ""} onChange={(e) => updateLine(idx, { entityType: e.target.value })} placeholder="client|employee|vendor" />
                </div>
                <div>
                  <Label>Entity ID</Label>
                  <Input value={l.entityId || ""} onChange={(e) => updateLine(idx, { entityId: e.target.value })} />
                </div>
                <div className="sm:col-span-6">
                  <Label>Description</Label>
                  <Input value={l.description || ""} onChange={(e) => updateLine(idx, { description: e.target.value })} />
                </div>
                <div className="sm:col-span-6 flex justify-end">
                  <Button variant="destructive" type="button" onClick={() => removeLine(idx)} disabled={lines.length <= 2}>Remove</Button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Totals: Debit {totalDebit.toFixed(2)} | Credit {totalCredit.toFixed(2)}</div>
              <Button type="button" onClick={addLine}>Add Line</Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={submit} disabled={busy || totalDebit !== totalCredit}>Post Journal</Button>
          </div>
          {message && <div className="text-sm text-muted-foreground">{message}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
