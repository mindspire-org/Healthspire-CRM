import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Filter, Plus, Search, Upload, Tags, Paperclip, MoreVertical, Eye, Pencil, Trash2, FolderKanban, TrendingUp, Users, Clock, DollarSign, Target, BarChart3, Activity, Briefcase, Sparkles, Zap, Star, Printer } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { getAuthHeaders } from "@/lib/api/auth";
import { API_BASE } from "@/lib/api/base";

const getStoredAuthUser = () => {
  const raw = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

interface Row {
  id: string;
  title: string;
  clientId?: string;
  client: string;
  price: string;
  start: string; // yyyy-mm-dd
  due: string; // yyyy-mm-dd
  progress: number; // 0-100
  status: "Open" | "Completed" | "Hold";
  labels?: string;
  description?: string;
}


export default function Overview() {
  const navigate = useNavigate();
  const user = getStoredAuthUser();
  const isAdmin = user?.role === "admin";
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openLabels, setOpenLabels] = useState(false);
  const [loading, setLoading] = useState(true);
  // form state
  const [title, setTitle] = useState("");
  const [projectType, setProjectType] = useState("Client Project");
  const [client, setClient] = useState("");
  const [clientIdSel, setClientIdSel] = useState("");
  const [clientOptions, setClientOptions] = useState<{ id: string; name: string }[]>([]);
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState("");
  const [deadline, setDeadline] = useState("");
  const [price, setPrice] = useState("");
  const [labels, setLabels] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [labelFilter, setLabelFilter] = useState("__all__");
  const [startFrom, setStartFrom] = useState("");
  const [deadlineTo, setDeadlineTo] = useState("");
  const [labelOptions, setLabelOptions] = useState<string[]>([]);
  const [labelDraft, setLabelDraft] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Progress editor dialog state
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressProjectId, setProgressProjectId] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalProjects = rows.length;
    const completedProjects = rows.filter(r => r.status === "Completed").length;
    const activeProjects = rows.filter(r => r.status === "Open").length;
    const onHoldProjects = rows.filter(r => r.status === "Hold").length;
    const avgProgress = totalProjects > 0 ? Math.round(rows.reduce((acc, r) => acc + r.progress, 0) / totalProjects) : 0;

    return {
      totalProjects,
      completedProjects,
      activeProjects,
      onHoldProjects,
      avgProgress
    };
  }, [rows]);

  const mapProjectRow = (d: any): Row => ({
    id: String(d._id || ""),
    title: d.title || "-",
    clientId: d.clientId ? String(d.clientId) : undefined,
    client: d.client || "-",
    price: d.price != null ? String(d.price) : "-",
    start: d.start ? new Date(d.start).toISOString().slice(0, 10) : "-",
    due: d.deadline ? new Date(d.deadline).toISOString().slice(0, 10) : "-",
    progress: (() => {
      const p = typeof d.progress === "number" ? Number(d.progress) : d.status === "Completed" ? 100 : 0;
      return Math.max(0, Math.min(100, Number.isFinite(p) ? p : 0));
    })(),
    status: (d.status as any) || "Open",
    labels: typeof d.labels === "string" ? d.labels : Array.isArray(d.labels) ? d.labels.join(", ") : "",
    description: d.description || "",
  });

  const loadProjects = async (q: string) => {
    setLoading(true);
    try {
      const url = `${API_BASE}/api/projects${q ? `?q=${encodeURIComponent(q)}` : ""}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setRows((Array.isArray(data) ? data : []).map(mapProjectRow));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects(query);
  }, [query]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/clients`, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        const opts: { id: string; name: string }[] = (Array.isArray(data) ? data : [])
          .map((c: any) => ({ id: String(c._id || ""), name: (c.company || c.person || "-") }))
          .filter((c: any) => c.id && c.name);
        setClientOptions(opts);
        if (!client && opts.length) {
          setClient(opts[0].name);
          setClientIdSel(opts[0].id);
        }
      } catch { }
    })();
  }, []);

  useEffect(() => {
    try {
      const ls = JSON.parse(localStorage.getItem("project_labels") || "[]");
      if (Array.isArray(ls)) setLabelOptions(ls.filter((x: any) => typeof x === "string" && x.trim()).map((x: string) => x.trim()));
    } catch { }
  }, []);

  useEffect(() => {
    if (!openLabels) return;
    setLabelDraft(labelOptions);
    setNewLabel("");
  }, [openLabels, labelOptions]);

  const createProject = async () => {
    if (!isAdmin) {
      toast.error("Only admins can create projects");
      return;
    }
    if (!title.trim()) {
      toast.error("Project title is required");
      return;
    }
    try {
      setLoading(true);
      const payload: any = {
        title: title.trim(),
        client: clientIdSel ? undefined : String(client || "").trim(),
        clientId: clientIdSel || undefined,
        price: price ? Number(price) : 0,
        start: start ? new Date(start) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        status: "Open",
        description: desc,
        labels: labels
          ? labels
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean)
            .join(", ")
          : "",
      };
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await loadProjects(query);
        toast.success("Project created successfully");
        setOpenAdd(false);
        // Reset form
        setTitle("");
        setClient("");
        setClientIdSel("");
        setStart("");
        setDeadline("");
        setPrice("");
        setLabels("");
        setDesc("");
        setProjectType("Client Project");
      }
    } catch {
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      if (!window.confirm("Delete this project?")) return;
      await fetch(`${API_BASE}/api/projects/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Project removed");
    } catch { }
  };

  const updateProjectStatus = async (id: string, status: Row["status"]) => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status, progress: status === "Completed" ? 100 : r.progress } : r)));
        toast.success("Status updated");
      }
    } catch { }
  };

  const openEdit = (r: Row) => {
    setEditingId(r.id);
    setTitle(r.title || "");
    setClient(r.client || "");
    if (r.clientId) setClientIdSel(r.clientId);
    setStart(r.start && r.start !== "-" ? r.start : "");
    setDeadline(r.due && r.due !== "-" ? r.due : "");
    setPrice(r.price && r.price !== "-" ? r.price : "");
    setLabels(r.labels || "");
    setDesc(r.description || "");
    setOpenAdd(true);
  };

  const openProgressEditor = (r: Row) => {
    setProgressProjectId(r.id);
    setProgressValue(r.progress || 0);
    setProgressOpen(true);
  };

  const saveProgressValue = async () => {
    if (!progressProjectId) return;
    const value = Math.max(0, Math.min(100, Number(progressValue) || 0));
    try {
      const res = await fetch(`${API_BASE}/api/projects/${progressProjectId}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ progress: value }),
      });
      if (res.ok) {
        setRows(prev => prev.map(r => r.id === progressProjectId ? { ...r, progress: value, status: r.status } : r));
        toast.success("Progress updated");
      } else {
        setRows(prev => prev.map(r => r.id === progressProjectId ? { ...r, progress: value } : r));
      }
    } catch {
      setRows(prev => prev.map(r => r.id === progressProjectId ? { ...r, progress: value } : r));
    } finally {
      setProgressOpen(false);
      setProgressProjectId(null);
    }
  };

  const filtered = useMemo(() => {
    let out = rows;
    if (query) {
      const s = query.toLowerCase();
      out = out.filter(r => [r.title, r.client, r.status].some(v => v.toLowerCase().includes(s)));
    }
    if (statusFilter && statusFilter !== "__all__") out = out.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    if (labelFilter && labelFilter !== "__all__") out = out.filter(r => (r.labels || "").split(",").map(x => x.trim().toLowerCase()).includes(labelFilter.toLowerCase()));
    if (startFrom) out = out.filter(r => r.start && r.start !== "-" && r.start >= startFrom);
    if (deadlineTo) out = out.filter(r => r.due && r.due !== "-" && r.due <= deadlineTo);
    return out;
  }, [rows, query, statusFilter, labelFilter, startFrom, deadlineTo]);

  const manageLabels = () => {
    setOpenLabels(true);
  };

  const saveLabels = () => {
    const arr = labelDraft.map((x) => String(x || "").trim()).filter(Boolean);
    setLabelOptions(arr);
    localStorage.setItem("project_labels", JSON.stringify(arr));
    toast.success("Labels updated");
    setOpenLabels(false);
  };

  const resetFilters = () => {
    setStatusFilter("__all__");
    setLabelFilter("__all__");
    setStartFrom("");
    setDeadlineTo("");
    setQuery("");
  };

  const exportToCSV = () => {
    const header = ["ID", "Title", "Client", "Price", "Start date", "Deadline", "Progress", "Status", "Labels"];
    const lines = filtered.map((r, idx) => [idx + 1, r.title, r.client, r.price, r.start, r.due, `${r.progress}%`, r.status, r.labels || ""]);
    const csv = [header, ...lines].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printTable = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const rowsHtml = filtered.map((r, idx) => `<tr>
      <td>${idx + 1}</td>
      <td>${r.title}</td>
      <td>${r.client}</td>
      <td>${r.price}</td>
      <td>${r.start}</td>
      <td>${r.due}</td>
      <td>${r.progress}%</td>
      <td>${r.status}</td>
    </tr>`).join("");
    w.document.write(`<!doctype html><html><head><title>Projects</title></head><body>
      <h3>Projects</h3>
      <table border="1" cellspacing="0" cellpadding="6">
        <thead><tr><th>#</th><th>Title</th><th>Client</th><th>Price</th><th>Start date</th><th>Deadline</th><th>Progress</th><th>Status</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const triggerImport = () => fileInputRef.current?.click();
  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length === 0) return;
      const header = lines[0].toLowerCase();
      const hasHeader = ["title", "client", "price", "start", "deadline"].every(k => header.includes(k));
      const body = hasHeader ? lines.slice(1) : lines;
      let imported = 0;
      for (const line of body) {
        const cols = line.split(",").map(c => c.replace(/^\"|\"$/g, "").trim());
        const [t, c, p, s, d, st] = cols;
        if (!t) continue;
        const payload: any = {
          title: t,
          client: c,
          price: p ? Number(p) : 0,
          start: s ? new Date(s) : undefined,
          deadline: d ? new Date(d) : undefined,
          status: st || "Open",
        };
        const res = await fetch(`${API_BASE}/api/projects`, { method: "POST", headers: getAuthHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(payload) });
        if (res.ok) imported++;
      }
      toast.success(`Imported ${imported} project(s)`);
      const ref = await fetch(`${API_BASE}/api/projects${query ? `?q=${encodeURIComponent(query)}` : ""}`, { headers: getAuthHeaders() });
      if (ref.ok) {
        const data = await ref.json();
        const mapped: Row[] = (Array.isArray(data) ? data : []).map((d: any) => ({
          id: String(d._id || ""),
          title: d.title || "-",
          clientId: d.clientId ? String(d.clientId) : undefined,
          client: d.client || "-",
          price: d.price != null ? String(d.price) : "-",
          start: d.start ? new Date(d.start).toISOString().slice(0, 10) : "-",
          due: d.deadline ? new Date(d.deadline).toISOString().slice(0, 10) : "-",
          progress: d.status === "Completed" ? 100 : 0,
          status: (d.status as any) || "Open",
          labels: typeof d.labels === "string" ? d.labels : Array.isArray(d.labels) ? d.labels.join(", ") : "",
          description: d.description || "",
        }));
        setRows(mapped);
      }
    } catch {
      toast.error("Failed to import projects");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, animation: 'pulse 3s ease-in-out infinite' }} />
        <div className="relative px-6 py-12 sm:px-12 lg:px-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <FolderKanban className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Projects Overview
                  </h1>
                  <p className="mt-2 text-lg text-white/80">
                    Manage and track all your projects efficiently
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Target className="w-3 h-3 mr-1" />
                  {analytics.totalProjects} Total Projects
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Activity className="w-3 h-3 mr-1" />
                  {analytics.activeProjects} Active
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {analytics.avgProgress}% Avg Progress
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                <Link to="/projects/timeline">
                  <Clock className="w-4 h-4 mr-2" />
                  Timeline View
                </Link>
              </Button>
              <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90" disabled={!isAdmin}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  {!isAdmin && (
                    <div className="text-sm text-destructive">Only admins can create projects.</div>
                  )}
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Title</Label>
                      <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">Type</Label>
                      <Select value={projectType} onValueChange={setProjectType}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Client Project">Client Project</SelectItem>
                          <SelectItem value="Internal Project">Internal Project</SelectItem>
                          <SelectItem value="Research Project">Research Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="client" className="text-right">Client</Label>
                      {clientOptions.length ? (
                        <Select value={clientIdSel} onValueChange={(v) => {
                          setClientIdSel(v);
                          const name = clientOptions.find((o) => o.id === v)?.name || "";
                          setClient(name);
                        }}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No client</SelectItem>
                            {clientOptions.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="client"
                          value={client}
                          onChange={(e) => setClient(e.target.value)}
                          className="col-span-3"
                          placeholder="Client name"
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="desc" className="text-right">Description</Label>
                      <Textarea id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="start" className="text-right">Start Date</Label>
                      <Input id="start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="deadline" className="text-right">Deadline</Label>
                      <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">Price</Label>
                      <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="labels" className="text-right">Labels</Label>
                      <Input id="labels" value={labels} onChange={(e) => setLabels(e.target.value)} placeholder="Comma separated" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={createProject} disabled={!isAdmin || loading}>Create Project</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-12 lg:px-16 space-y-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-100">
                <Briefcase className="w-5 h-5" /> Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <div className="text-3xl font-bold">{analytics.totalProjects}</div>
              <div className="flex items-center gap-2 text-sm text-emerald-100">
                <TrendingUp className="w-4 h-4" />
                All Projects
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-100">
                <Activity className="w-5 h-5" /> Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <div className="text-3xl font-bold">{analytics.activeProjects}</div>
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <Zap className="w-4 h-4" />
                In Progress
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-100">
                <Star className="w-5 h-5" /> Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <div className="text-3xl font-bold">{analytics.completedProjects}</div>
              <div className="flex items-center gap-2 text-sm text-purple-100">
                <Sparkles className="w-4 h-4" />
                Finished Projects
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-100">
                <Target className="w-5 h-5" /> Avg Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <div className="text-3xl font-bold">{analytics.avgProgress}%</div>
              <div className="flex items-center gap-2 text-sm text-amber-100">
                <BarChart3 className="w-4 h-4" />
                Overall Progress
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Hold">Hold</SelectItem>
                </SelectContent>
              </Select>

              <Select value={labelFilter} onValueChange={setLabelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Labels</SelectItem>
                  {labelOptions.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="w-40"
                  value={startFrom}
                  onChange={(e) => setStartFrom(e.target.value)}
                  placeholder="Start from"
                />
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="w-40"
                  value={deadlineTo}
                  onChange={(e) => setDeadlineTo(e.target.value)}
                  placeholder="Deadline to"
                />
              </div>

              <div className="ml-auto flex items-center gap-3">
                {isAdmin && (
                  <Dialog open={openLabels} onOpenChange={setOpenLabels}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Tags className="w-4 h-4 mr-2" />
                        Manage Labels
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Manage Project Labels</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="New label name"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newLabel.trim()) {
                                const updated = [...labelOptions, newLabel.trim()];
                                setLabelOptions(updated);
                                setNewLabel("");
                              }
                            }}
                          />
                          <Button onClick={() => {
                            if (newLabel.trim()) {
                              const updated = [...labelOptions, newLabel.trim()];
                              setLabelOptions(updated);
                              setNewLabel("");
                            }
                          }}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {labelOptions.map((label) => (
                            <Badge key={label} variant="outline" className="cursor-pointer" onClick={() => {
                              setLabelOptions(labelOptions.filter(l => l !== label));
                            }}>
                              {label} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Upload className="w-4 h-4 mr-2" />
                  Export
                </Button>

                <Button variant="outline" size="sm" onClick={printTable}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9 w-64"
                    placeholder="Search projects..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-blue-600" />
              Projects ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r, idx) => (
                    <TableRow key={r.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium text-primary"
                          onClick={() => navigate(`/projects/overview/${r.id}`)}
                        >
                          {r.title}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {r.clientId ? (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary"
                            onClick={() => navigate(`/clients/${r.clientId}`)}
                          >
                            {r.client}
                          </Button>
                        ) : (
                          r.client
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{r.price}</TableCell>
                      <TableCell>{r.start}</TableCell>
                      <TableCell className={new Date(r.due) < new Date(r.start) ? "text-destructive font-medium" : ""}>
                        {r.due}
                      </TableCell>
                      <TableCell className="min-w-[140px]">
                        <button
                          className="w-full text-left hover:opacity-80 transition-opacity"
                          onClick={() => openProgressEditor(r)}
                          title="Click to update progress"
                        >
                          <div className="flex items-center gap-2">
                            <Progress value={r.progress} className="flex-1 h-2" />
                            <div className="text-xs text-muted-foreground w-10 text-right font-medium">
                              {r.progress}%
                            </div>
                          </div>
                        </button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              {r.status}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateProjectStatus(r.id, "Open")}>
                              <Badge variant="outline" className="mr-2">Open</Badge>
                              Mark as Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateProjectStatus(r.id, "Completed")}>
                              <Badge variant="default" className="mr-2">Completed</Badge>
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateProjectStatus(r.id, "Hold")}>
                              <Badge variant="secondary" className="mr-2">Hold</Badge>
                              Put on Hold
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" aria-label="Actions">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/projects/overview/${r.id}`)}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(r)}>
                              <Pencil className="w-4 h-4 mr-2" /> Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteProject(r.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                        <div className="flex flex-col items-center gap-2">
                          <FolderKanban className="w-12 h-12 text-muted-foreground/50" />
                          <p className="text-lg font-medium">No projects found</p>
                          <p className="text-sm">Try adjusting your filters or create a new project</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Progress Editor Dialog */}
        <Dialog open={progressOpen} onOpenChange={setProgressOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Project Progress</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Progress: {progressValue}%</Label>
                <Input
                  type="range"
                  min={0}
                  max={100}
                  value={progressValue}
                  onChange={(e) => setProgressValue(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="progress-number">Progress Percentage</Label>
                <Input
                  id="progress-number"
                  type="number"
                  min={0}
                  max={100}
                  value={progressValue}
                  onChange={(e) => setProgressValue(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={saveProgressValue}>Update Progress</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
