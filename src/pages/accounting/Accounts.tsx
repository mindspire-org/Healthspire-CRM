import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [form, setForm] = useState<Account>({
    code: "",
    name: "",
    type: "asset",
    parentCode: "",
    isActive: true,
  });
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((a) =>
      a.code.toLowerCase().includes(s) ||
      a.name.toLowerCase().includes(s) ||
      a.type.toLowerCase().includes(s)
    );
  }, [q, items]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/accounts`, {
        headers: { ...getAuthHeaders() },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      setItems(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setMessage(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

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
      setForm({
        code: "",
        name: "",
        type: "asset",
        parentCode: "",
        isActive: true,
      });
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
    <div className="p-4 space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-600/10 via-sky-500/5 to-emerald-500/10">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.20),transparent_35%),radial-gradient(circle_at_60%_90%,rgba(34,197,94,0.16),transparent_45%)]" />
        <div className="relative p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Accounting</div>
            <div className="text-2xl font-semibold tracking-tight">Chart of Accounts</div>
            <div className="text-sm text-muted-foreground">
              Create, organize and maintain your accounts structure.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={loading ? "secondary" : "default"}>
              {loading ? "Loading…" : `${filtered.length} accounts`}
            </Badge>
            <Button variant="outline" onClick={load} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Add new account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
              <div>
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, code: e.target.value }))
                  }
                  placeholder="e.g. 1000"
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Cash"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, type: v as Account["type"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Parent Code (optional)</Label>
                <Input
                  value={form.parentCode || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, parentCode: e.target.value }))
                  }
                  placeholder="e.g. 1000"
                />
              </div>
            </div>
            <Button
              onClick={create}
              disabled={!form.code || !form.name}
              className="w-full"
            >
              Add account
            </Button>
            {message && (
              <div className="text-sm text-destructive">{message}</div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Input
                className="sm:max-w-xs"
                placeholder="Search accounts by code, name or type..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                Edit fields inline and click Save per row.
              </div>
            </div>

            <Separator />

            <div className="overflow-auto rounded-lg border">
              <table className="min-w-[920px] w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="text-left border-b">
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Parent</th>
                    <th className="py-3 px-3">Active</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr
                      key={a._id || a.code}
                      className="border-b border-border/50 hover:bg-muted/20"
                    >
                      <td className="py-2 px-3 font-medium whitespace-nowrap">
                        {a.code}
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          value={a.name}
                          onChange={(e) =>
                            setItems((cur) =>
                              cur.map((x) =>
                                x._id === a._id
                                  ? { ...x, name: e.target.value }
                                  : x
                              )
                            )
                          }
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Select
                          value={a.type}
                          onValueChange={(v) =>
                            setItems((cur) =>
                              cur.map((x) =>
                                x._id === a._id
                                  ? { ...x, type: v as Account["type"] }
                                  : x
                              )
                            )
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          value={a.parentCode || ""}
                          onChange={(e) =>
                            setItems((cur) =>
                              cur.map((x) =>
                                x._id === a._id
                                  ? { ...x, parentCode: e.target.value }
                                  : x
                              )
                            )
                          }
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Select
                          value={a.isActive ? "1" : "0"}
                          onValueChange={(v) =>
                            setItems((cur) =>
                              cur.map((x) =>
                                x._id === a._id
                                  ? { ...x, isActive: v === "1" }
                                  : x
                              )
                            )
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Yes</SelectItem>
                            <SelectItem value="0">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            update(a._id!, {
                              name: a.name,
                              type: a.type,
                              parentCode: a.parentCode || null,
                              isActive: a.isActive,
                            })
                          }
                        >
                          Save
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        No accounts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
