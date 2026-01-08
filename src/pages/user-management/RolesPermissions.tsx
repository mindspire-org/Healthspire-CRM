import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, ChevronDown, RefreshCw, Settings, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { API_BASE } from "@/lib/api/base";
import { getAuthHeaders } from "@/lib/api/auth";
import { toast } from "@/components/ui/sonner";

type RoleRow = {
  _id: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
};

const ALL_PERMS: Array<{ key: string; label: string }> = [
  { key: "crm", label: "CRM" },
  { key: "hrm", label: "HRM" },
  { key: "projects", label: "Projects" },
  { key: "prospects", label: "Prospects" },
  { key: "sales", label: "Sales" },
  { key: "reports", label: "Reports" },
  { key: "clients", label: "Clients" },
  { key: "tasks", label: "Tasks" },
  { key: "messages", label: "Messages" },
  { key: "tickets", label: "Tickets" },
  { key: "announcements", label: "Announcements" },
  { key: "calendar", label: "Calendar" },
  { key: "events", label: "Events" },
  { key: "subscriptions", label: "Subscriptions" },
  { key: "notes", label: "Notes" },
  { key: "files", label: "Files" },
];

export default function RolesPermissions() {
  const [query, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RoleRow[]>([]);

  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addPerms, setAddPerms] = useState<Set<string>>(new Set());

  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPerms, setEditPerms] = useState<Set<string>>(new Set());

  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState<RoleRow | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders({ "Content-Type": "application/json" });
      const res = await fetch(`${API_BASE}/api/roles`, { headers });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load roles");
      setItems(Array.isArray(json) ? json : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => {
      return (
        String(r.name || "").toLowerCase().includes(q) ||
        String(r.description || "").toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  const toggleAddPerm = (k: string) => {
    setAddPerms((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const toggleEditPerm = (k: string) => {
    setEditPerms((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const openEditRole = (r: RoleRow) => {
    setEditing(r);
    setEditName(String(r.name || ""));
    setEditDescription(String(r.description || ""));
    setEditPerms(new Set(Array.isArray(r.permissions) ? r.permissions : []));
    setOpenEdit(true);
  };

  const saveAdd = async () => {
    const name = addName.trim();
    if (!name) throw new Error("Role name is required");
    const headers = getAuthHeaders({ "Content-Type": "application/json" });
    const res = await fetch(`${API_BASE}/api/roles`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name,
        description: addDescription.trim(),
        permissions: Array.from(addPerms),
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || "Failed to create role");
    setOpenAdd(false);
    setAddName("");
    setAddDescription("");
    setAddPerms(new Set());
    await load();
  };

  const saveEdit = async () => {
    if (!editing?._id) return;
    const name = editName.trim();
    if (!name) throw new Error("Role name is required");
    const headers = getAuthHeaders({ "Content-Type": "application/json" });
    const res = await fetch(`${API_BASE}/api/roles/${editing._id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        name,
        description: editDescription.trim(),
        permissions: Array.from(editPerms),
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || "Failed to update role");
    setOpenEdit(false);
    setEditing(null);
    setEditName("");
    setEditDescription("");
    setEditPerms(new Set());
    await load();
  };

  const confirmDelete = (r: RoleRow) => {
    setDeleting(r);
    setOpenDelete(true);
  };

  const doDelete = async () => {
    if (!deleting?._id) return;
    const headers = getAuthHeaders({ "Content-Type": "application/json" });
    const res = await fetch(`${API_BASE}/api/roles/${deleting._id}`, {
      method: "DELETE",
      headers,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || "Failed to delete role");
    setOpenDelete(false);
    setDeleting(null);
    await load();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Roles & Permissions</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Export <ChevronDown className="w-4 h-4 ml-2"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>CSV</DropdownMenuItem>
              <DropdownMenuItem>Excel</DropdownMenuItem>
              <DropdownMenuItem>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}><RefreshCw className="w-4 h-4"/></Button>
          <Button variant="outline" size="icon"><Settings className="w-4 h-4"/></Button>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild><Button className="bg-red-500 hover:bg-red-500/90" size="sm"><Plus className="w-4 h-4 mr-2"/>Add New Role</Button></DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader><DialogTitle>Add role</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Input placeholder="Role name" value={addName} onChange={(e)=>setAddName(e.target.value)} />
                <Input placeholder="Description" value={addDescription} onChange={(e)=>setAddDescription(e.target.value)} />
                <div className="grid sm:grid-cols-2 gap-2 pt-2 border-t">
                  {ALL_PERMS.map((p) => (
                    <label key={p.key} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={addPerms.has(p.key)} onCheckedChange={() => toggleAddPerm(p.key)} />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpenAdd(false)}>Close</Button>
                <Button onClick={async ()=>{ try { await saveAdd(); toast.success('Role created'); } catch (e:any) { toast.error(e?.message || 'Failed'); } }}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-8"><Checkbox /></TableHead>
                <TableHead>Role Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r)=> (
                <TableRow key={r._id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : "-"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm"><MoreHorizontal className="w-4 h-4"/></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditRole(r)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => confirmDelete(r)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="bg-card">
              <DialogHeader><DialogTitle>Edit role</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Input placeholder="Role name" value={editName} onChange={(e)=>setEditName(e.target.value)} />
                <Input placeholder="Description" value={editDescription} onChange={(e)=>setEditDescription(e.target.value)} />
                <div className="grid sm:grid-cols-2 gap-2 pt-2 border-t">
                  {ALL_PERMS.map((p) => (
                    <label key={p.key} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={editPerms.has(p.key)} onCheckedChange={() => toggleEditPerm(p.key)} />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpenEdit(false)}>Close</Button>
                <Button onClick={async ()=>{ try { await saveEdit(); toast.success('Role updated'); } catch (e:any) { toast.error(e?.message || 'Failed'); } }}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openDelete} onOpenChange={setOpenDelete}>
            <DialogContent className="bg-card">
              <DialogHeader><DialogTitle>Delete role</DialogTitle></DialogHeader>
              <div className="py-2 text-sm text-muted-foreground">
                Are you sure you want to delete <span className="font-medium text-foreground">{deleting?.name}</span>?
                This action cannot be undone.
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDelete(false)}>Cancel</Button>
                <Button variant="destructive" onClick={async ()=>{ try { await doDelete(); toast.success('Role deleted'); } catch (e:any) { toast.error(e?.message || 'Failed'); } }}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
