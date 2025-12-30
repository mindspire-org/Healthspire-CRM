import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthHeaders } from "@/lib/api/auth";
import { API_BASE } from "@/lib/api/base";

export type Account = {
  _id?: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  parentCode?: string | null;
  isActive?: boolean;
};

export default function Accounts() {
  const [items, setItems] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<Account>({ code: "", name: "", type: "asset", parentCode: "", isActive: true });
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((a) => a.code.toLowerCase().includes(s) || a.name.toLowerCase().includes(s) || a.type.toLowerCase().includes(s));
  }, [q, items]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/accounts`, { headers: { ...getAuthHeaders() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      setItems(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setMessage(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const create = async () => {
    setMessage("");
    try {
      const payload = { ...form, parentCode: form.parentCode || null };
      const res = await fetch(`${API_BASE}/api/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Create failed");
      setForm({ code: "", name: "", type: "asset", parentCode: "", isActive: true });
      await load();
    } catch (e: any) {
      setMessage(e?.message || "Failed");
    }
  };

  const update = async (id: string, patch: Partial<Account>) => {
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Update failed");
      await load();
    } catch (e: any) {
      setMessage(e?.message || "Failed");
    }
  };

  const TYPES = ["asset", "liability", "equity", "revenue", "expense"] as const;

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Chart of Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div>
              <Label>Code</Label>
              <Input value={form.code} onChange={(e)=>setForm((p)=>({ ...p, code: e.target.value }))} placeholder="e.g. 1000" />
            </div>
            <div className="sm:col-span-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e)=>setForm((p)=>({ ...p, name: e.target.value }))} placeholder="Cash" />
            </div>
            <div>
              <Label>Type</Label>
              <select className="border rounded h-10 px-2 w-full bg-background" value={form.type} onChange={(e)=>setForm((p)=>({ ...p, type: e.target.value as Account["type"] }))}>
                {TYPES.map((t)=> <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>Parent Code (opt)</Label>
              <Input value={form.parentCode || ""} onChange={(e)=>setForm((p)=>({ ...p, parentCode: e.target.value }))} placeholder="e.g. 1000" />
            </div>
            <div className="flex items-end">
              <Button onClick={create} disabled={!form.code || !form.name}>Add</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Input className="max-w-xs" placeholder="Search accounts..." value={q} onChange={(e)=>setQ(e.target.value)} />
            <div className="text-xs text-muted-foreground">{loading ? "Loading..." : `${filtered.length} accounts`}</div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-[760px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">Code</th>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">Parent</th>
                  <th className="py-2 pr-2">Active</th>
                  <th className="py-2 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a)=> (
                  <tr key={a._id || a.code} className="border-b border-border/50">
                    <td className="py-1 pr-2">{a.code}</td>
                    <td className="py-1 pr-2">
                      <Input value={a.name} onChange={(e)=> setItems((cur)=> cur.map((x)=> x._id===a._id? { ...x, name: e.target.value }: x))} />
                    </td>
                    <td className="py-1 pr-2">
                      <select className="border rounded h-9 px-2 bg-background" value={a.type} onChange={(e)=> setItems((cur)=> cur.map((x)=> x._id===a._id? { ...x, type: e.target.value as Account["type"] }: x))}>
                        {TYPES.map((t)=> <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="py-1 pr-2">
                      <Input value={a.parentCode || ""} onChange={(e)=> setItems((cur)=> cur.map((x)=> x._id===a._id? { ...x, parentCode: e.target.value }: x))} />
                    </td>
                    <td className="py-1 pr-2">
                      <select className="border rounded h-9 px-2 bg-background" value={a.isActive? "1":"0"} onChange={(e)=> setItems((cur)=> cur.map((x)=> x._id===a._id? { ...x, isActive: e.target.value === "1" }: x))}>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </td>
                    <td className="py-1 pr-2 text-right space-x-2">
                      <Button size="sm" variant="secondary" onClick={()=> update(a._id!, { name: a.name, type: a.type, parentCode: a.parentCode || null, isActive: a.isActive })}>Save</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {message && <div className="text-sm text-destructive">{message}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
