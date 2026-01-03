import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    <div className="p-4 space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-600/10 via-sky-500/5 to-emerald-500/10">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.20),transparent_35%),radial-gradient(circle_at_60%_90%,rgba(34,197,94,0.16),transparent_45%)]" />
        <div className="relative p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Accounting</div>
            <div className="text-2xl font-semibold tracking-tight">Journal Entry</div>
            <div className="text-sm text-muted-foreground">Post vouchers with balanced debit/credit lines.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={totalDebit === totalCredit ? "success" : "warning"}>
              {totalDebit === totalCredit ? "Balanced" : "Not balanced"}
            </Badge>
            <Badge variant="secondary">Debit {totalDebit.toFixed(2)}</Badge>
            <Badge variant="secondary">Credit {totalCredit.toFixed(2)}</Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voucher details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="lg:col-span-2">
              <Label>Memo</Label>
              <Input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="e.g. Office rent for January" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voucher lines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {lines.map((l, idx) => (
              <div key={idx} className="rounded-xl border p-4 space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
                  <div className="lg:col-span-2">
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
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label>Description</Label>
                    <Input value={l.description || ""} onChange={(e) => updateLine(idx, { description: e.target.value })} placeholder="Optional line description" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="destructive" type="button" onClick={() => removeLine(idx)} disabled={lines.length <= 2}>
                    Remove line
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button type="button" onClick={addLine} variant="secondary">
              Add line
            </Button>
            <div className="text-sm text-muted-foreground">
              Totals must match before posting.
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {message ? <div className="text-sm text-muted-foreground">{message}</div> : <div />}
            <Button onClick={submit} disabled={busy || totalDebit !== totalCredit}>
              Post Journal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
