import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getAuthHeaders } from "@/lib/api/auth";
import { API_BASE } from "@/lib/api/base";
import { toast } from "@/components/ui/sonner";

export default function Vendors() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{ name: string; company?: string; email?: string; phone?: string }>({ name: "", company: "" });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((v) => (v.name || "").toLowerCase().includes(s) || (v.company || "").toLowerCase().includes(s));
  }, [q, items]);

  const load = async () => {
    setBusy(true);
    try {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      const res = await fetch(`${API_BASE}/api/vendors?${sp.toString()}`, { headers: { ...getAuthHeaders() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load vendors");
      setItems(Array.isArray(json) ? json : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load vendors");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const create = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Create failed");
      setForm({ name: "", company: "" });
      toast.success("Vendor created");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Create failed");
    } finally {
      setBusy(false);
    }
  };

  const update = async (id: string, patch: any) => {
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Update failed");
      toast.success("Saved");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e)=>setForm((f)=>({ ...f, name: e.target.value }))} placeholder="Vendor name" />
            </div>
            <div className="sm:col-span-2">
              <Label>Company</Label>
              <Input value={form.company || ""} onChange={(e)=>setForm((f)=>({ ...f, company: e.target.value }))} placeholder="Company (optional)" />
            </div>
            <div className="flex items-end">
              <Button onClick={create} disabled={busy || !form.name.trim()}>Add</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Input className="max-w-xs" placeholder="Search vendors..." value={q} onChange={(e)=>setQ(e.target.value)} />
            <div className="text-xs text-muted-foreground">{busy ? "Loading..." : `${filtered.length} vendors`}</div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Company</th>
                  <th className="py-2 pr-2">Email</th>
                  <th className="py-2 pr-2">Phone</th>
                  <th className="py-2 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v)=> (
                  <tr key={v._id} className="border-b border-border/50">
                    <td className="py-1 pr-2">
                      <Input value={v.name} onChange={(e)=> setItems((arr)=> arr.map((x)=> x._id===v._id? { ...x, name: e.target.value }: x))} />
                    </td>
                    <td className="py-1 pr-2">
                      <Input value={v.company||""} onChange={(e)=> setItems((arr)=> arr.map((x)=> x._id===v._id? { ...x, company: e.target.value }: x))} />
                    </td>
                    <td className="py-1 pr-2">
                      <Input value={v.email||""} onChange={(e)=> setItems((arr)=> arr.map((x)=> x._id===v._id? { ...x, email: e.target.value }: x))} />
                    </td>
                    <td className="py-1 pr-2">
                      <Input value={v.phone||""} onChange={(e)=> setItems((arr)=> arr.map((x)=> x._id===v._id? { ...x, phone: e.target.value }: x))} />
                    </td>
                    <td className="py-1 pr-2 text-right">
                      <Button size="sm" variant="secondary" onClick={()=> update(v._id, { name: v.name, company: v.company, email: v.email, phone: v.phone })}>Save</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
