import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getAuthHeaders } from "@/lib/api/auth";
import { API_BASE } from "@/lib/api/base";

interface Period { _id?: string; name?: string; start: string; end: string; locked?: boolean; note?: string }

export default function AccountingPeriods() {
  const [items, setItems] = useState<Period[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<Period>({ name: "", start: "", end: "", locked: false, note: "" });

  const load = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/accounting-periods`, { headers: { ...getAuthHeaders() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      const mapped = (json || []).map((p: any) => ({ ...p, start: String(p.start).slice(0,10), end: String(p.end).slice(0,10) }));
      setItems(mapped);
    } catch (e: any) {
      setMsg(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const create = async () => {
    setBusy(true);
    setMsg("");
    try {
      const payload = { ...form };
      const res = await fetch(`${API_BASE}/api/accounting-periods`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Create failed");
      setForm({ name: "", start: "", end: "", locked: false, note: "" });
      await load();
    } catch (e: any) {
      setMsg(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleLock = async (p: Period) => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/accounting-periods/${p._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ locked: !p.locked }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Update failed");
      await load();
    } catch (e: any) {
      setMsg(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Accounting Periods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <Label>Name</Label>
              <Input value={form.name || ""} onChange={(e)=>setForm((s)=>({ ...s, name: e.target.value }))} placeholder="FY2026-2027" />
            </div>
            <div>
              <Label>Start</Label>
              <Input type="date" value={form.start} onChange={(e)=>setForm((s)=>({ ...s, start: e.target.value }))} />
            </div>
            <div>
              <Label>End</Label>
              <Input type="date" value={form.end} onChange={(e)=>setForm((s)=>({ ...s, end: e.target.value }))} />
            </div>
            <div className="flex items-end">
              <Button onClick={create} disabled={busy || !form.start || !form.end}>Create</Button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-[680px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Start</th>
                  <th className="py-2 pr-2">End</th>
                  <th className="py-2 pr-2">Locked</th>
                  <th className="py-2 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p)=> (
                  <tr key={p._id} className="border-b border-border/50">
                    <td className="py-1 pr-2">{p.name || ""}</td>
                    <td className="py-1 pr-2">{p.start}</td>
                    <td className="py-1 pr-2">{p.end}</td>
                    <td className="py-1 pr-2">{p.locked ? "Yes" : "No"}</td>
                    <td className="py-1 pr-2 text-right">
                      <Button size="sm" variant={p.locked?"secondary":"default"} onClick={()=>toggleLock(p)} disabled={busy}>
                        {p.locked ? "Unlock" : "Lock"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
