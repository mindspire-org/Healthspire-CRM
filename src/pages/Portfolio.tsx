import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  Download, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Star,
  Award,
  Briefcase,
  Users,
  Target,
  Sparkles,
  ChevronLeft,
  Mail,
  Globe,
  Calendar,
  TrendingUp,
  Activity
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import html2pdf from "html2pdf.js";

import { API_BASE } from "@/lib/api/base";
import { getAuthHeaders } from "@/lib/api/auth";

type ApiClient = {
  _id: string;
  type?: "org" | "person";
  company?: string;
  person?: string;
  owner?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  avatar?: string;
  labels?: string[];
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
};

type PortfolioClient = {
  id: string;
  displayName: string;
  owner: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  status: "active" | "inactive";
  labels: string[];
  avatar?: string;
  createdAt?: string;
};

export default function Portfolio() {
  const [clients, setClients] = useState<PortfolioClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");
  const [openPdfExport, setOpenPdfExport] = useState(false);
  const [pdfConfig, setPdfConfig] = useState({
    companyName: "Healthspire CRM",
    tagline: "Client Portfolio",
    primaryColor: "#2563EB",
    secondaryColor: "#7C3AED",
    status: "all" as "all" | "active" | "inactive",
    labels: [] as string[],
    includeStats: true,
  });
  const [openAddClient, setOpenAddClient] = useState(false);
  const [openTestimonial, setOpenTestimonial] = useState(false);
  const [selectedClient, setSelectedClient] = useState<PortfolioClient | null>(null);
  const [editingClient, setEditingClient] = useState<PortfolioClient | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    labels: "",
    status: "active" as const,
  });

  // Load clients data
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/clients`, { headers: getAuthHeaders() });
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error((data as any)?.error || "Failed to load clients");
      const mapped: PortfolioClient[] = (Array.isArray(data) ? data : []).map((c: ApiClient) => {
        const displayName = String(c.company || c.person || "Client").trim() || "Client";
        return {
          id: String(c._id),
          displayName,
          owner: String(c.owner || "").trim(),
          phone: String(c.phone || "").trim(),
          email: String(c.email || "").trim(),
          address: String(c.address || "").trim(),
          website: String(c.website || "").trim(),
          status: (c.status as any) || "active",
          labels: Array.isArray(c.labels) ? c.labels.map((x) => String(x)).filter(Boolean) : [],
          avatar: String(c.avatar || "") || undefined,
          createdAt: c.createdAt,
        };
      });
      setClients(mapped);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error((error as any)?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        client.displayName.toLowerCase().includes(q) ||
        client.owner.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.phone.toLowerCase().includes(q) ||
        client.labels.join(",").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      const matchesLabel = labelFilter === "all" || client.labels.includes(labelFilter);
      
      return matchesSearch && matchesStatus && matchesLabel;
    });
  }, [clients, searchQuery, statusFilter, labelFilter]);

  // Get unique industries for filter
  const labels = useMemo(() => {
    return Array.from(new Set(clients.flatMap((c) => c.labels))).sort();
  }, [clients]);

  // Add new client
  const addClient = async () => {
    try {
      const name = String(formData.name || "").trim();
      if (!name) {
        toast.error("Client name is required");
        return;
      }
      const payload: any = {
        type: "org",
        company: name,
        owner: String(formData.owner || "").trim() || undefined,
        phone: String(formData.phone || "").trim() || undefined,
        email: String(formData.email || "").trim() || undefined,
        address: String(formData.address || "").trim() || undefined,
        website: String(formData.website || "").trim() || undefined,
        labels: String(formData.labels || "")
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter(Boolean),
        status: formData.status,
      };

      const res = await fetch(`${API_BASE}/api/clients`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as any)?.error || "Failed to add client");
      await loadClients();
      
      // Reset form
      setFormData({
        name: "",
        owner: "",
        phone: "",
        email: "",
        address: "",
        website: "",
        labels: "",
        status: "active",
      });
      
      setOpenAddClient(false);
      toast.success("Client added successfully");
    } catch (error) {
      toast.error((error as any)?.message || "Failed to add client");
    }
  };

  const updateClient = async () => {
    if (!editingClient) return;
    try {
      const name = String(formData.name || "").trim();
      if (!name) {
        toast.error("Client name is required");
        return;
      }
      const payload: any = {
        company: name,
        owner: String(formData.owner || "").trim() || "",
        phone: String(formData.phone || "").trim() || "",
        email: String(formData.email || "").trim() || "",
        address: String(formData.address || "").trim() || "",
        website: String(formData.website || "").trim() || "",
        labels: String(formData.labels || "")
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter(Boolean),
        status: formData.status,
      };
      const res = await fetch(`${API_BASE}/api/clients/${encodeURIComponent(editingClient.id)}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as any)?.error || "Failed to update client");
      await loadClients();
      setOpenAddClient(false);
      setEditingClient(null);
      toast.success("Client updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update client");
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm("Delete this client?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/clients/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as any)?.error || "Failed to delete client");
      await loadClients();
      toast.success("Client deleted");
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete client");
    }
  };

  // Generate PDF testimonial
  const generateTestimonialPDF = (client: PortfolioClient) => {
    // This would integrate with a PDF generation library like jsPDF or react-pdf
    const testimonialContent = `
CLIENT TESTIMONIAL

Client: ${client.displayName}
Owner: ${client.owner || "-"}
Status: ${client.status}
Date: ${new Date().toLocaleDateString()}

TESTIMONIAL:
"No testimonial provided."

This client has been successfully served and we are proud to have them in our portfolio.
    `;

    // Create and download the text file (in real implementation, this would be a PDF)
    const blob = new Blob([testimonialContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.displayName.replace(/\s+/g, '_')}_testimonial.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Testimonial generated successfully");
  };

  // Generate portfolio PDF
  const generatePortfolioPDF = async () => {
    try {
      const byStatus = (c: PortfolioClient) => pdfConfig.status === "all" || c.status === pdfConfig.status;
      const byLabels = (c: PortfolioClient) =>
        !pdfConfig.labels.length || pdfConfig.labels.some((l) => (c.labels || []).includes(l));
      const rows = clients.filter((c) => byStatus(c) && byLabels(c));

      if (!rows.length) {
        toast.error("No clients match the selected export filters");
        return;
      }

      const el = document.createElement("div");
      el.style.position = "fixed";
      el.style.left = "-10000px";
      el.style.top = "0";
      el.style.width = "794px";
      el.style.background = "#ffffff";

      const created = new Date();
      const createdStr = created.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
      const paletteA = pdfConfig.primaryColor;
      const paletteB = pdfConfig.secondaryColor;

      const total = rows.length;
      const active = rows.filter((c) => c.status === "active").length;
      const inactive = rows.filter((c) => c.status === "inactive").length;
      const uniqueLabels = Array.from(new Set(rows.flatMap((c) => c.labels || []))).length;

      const sanitize = (s: string) =>
        String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\"/g, "&quot;")
          .replace(/'/g, "&#039;");

      const initials = (name: string) => {
        const t = String(name || "").trim();
        if (!t) return "CL";
        return t
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
      };

      const statusPill = (s: string) => {
        const v = String(s || "inactive").toLowerCase();
        if (v === "active") return { bg: "#DCFCE7", fg: "#166534" };
        return { bg: "#F1F5F9", fg: "#475569" };
      };

      el.innerHTML = `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #0f172a; line-height: 1.45; padding: 18px;">
          <div style="background: linear-gradient(135deg, ${paletteA}, ${paletteB}); border-radius: 16px; padding: 28px 26px; color: #fff;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap: 14px;">
              <div>
                <div style="font-size: 26px; font-weight: 800; letter-spacing: -0.2px;">${sanitize(pdfConfig.companyName)}</div>
                <div style="margin-top: 4px; font-size: 14px; opacity: 0.9;">${sanitize(pdfConfig.tagline)}</div>
              </div>
              <div style="text-align:right; font-size:12px; opacity:0.9;">
                <div>Portfolio Export</div>
                <div>Generated: ${sanitize(createdStr)}</div>
              </div>
            </div>
          </div>

          ${pdfConfig.includeStats ? `
            <div style="margin-top: 16px; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; background: #f8fafc;">
              <div style="font-weight: 700; color: ${paletteA}; margin-bottom: 10px;">Overview</div>
              <div style="display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px;">
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius: 12px; padding: 12px;">
                  <div style="font-size: 11px; color:#64748b;">Total Clients</div>
                  <div style="font-size: 20px; font-weight: 800; color:${paletteA};">${total}</div>
                </div>
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius: 12px; padding: 12px;">
                  <div style="font-size: 11px; color:#64748b;">Active</div>
                  <div style="font-size: 20px; font-weight: 800; color:#16a34a;">${active}</div>
                </div>
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius: 12px; padding: 12px;">
                  <div style="font-size: 11px; color:#64748b;">Inactive</div>
                  <div style="font-size: 20px; font-weight: 800; color:#f59e0b;">${inactive}</div>
                </div>
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius: 12px; padding: 12px;">
                  <div style="font-size: 11px; color:#64748b;">Unique Labels</div>
                  <div style="font-size: 20px; font-weight: 800; color:${paletteB};">${uniqueLabels}</div>
                </div>
              </div>
            </div>
          ` : ""}

          <div style="margin-top: 16px;">
            <div style="display:flex; align-items:flex-end; justify-content:space-between; gap: 10px;">
              <div style="font-weight: 800; font-size: 16px; color: ${paletteA};">Clients</div>
              <div style="font-size: 11px; color:#64748b;">Showing ${total} client(s)</div>
            </div>
            <div style="margin-top: 10px; display:flex; flex-direction:column; gap: 10px;">
              ${rows
                .map((c) => {
                  const pill = statusPill(c.status);
                  const chips = (c.labels || [])
                    .slice(0, 10)
                    .map(
                      (l) =>
                        `<span style=\"display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px; font-size:11px; border:1px solid ${paletteA}33; color:${paletteA}; background:${paletteA}0f;\">${sanitize(l)}</span>`
                    )
                    .join(" ");
                  return `
                    <div style="border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; background:#fff; box-shadow: 0 6px 18px rgba(2,6,23,0.06); page-break-inside: avoid;">
                      <div style="display:flex; gap: 12px; align-items:center;">
                        <div style="width:44px; height:44px; border-radius: 14px; background: linear-gradient(135deg, ${paletteA}, ${paletteB}); display:flex; align-items:center; justify-content:center; color:#fff; font-weight: 800;">
                          ${sanitize(initials(c.displayName))}
                        </div>
                        <div style="flex:1; min-width:0;">
                          <div style="display:flex; align-items:center; justify-content:space-between; gap: 10px;">
                            <div style="font-size: 15px; font-weight: 800; color:#0f172a;">${sanitize(c.displayName)}</div>
                            <div style="padding:4px 10px; border-radius:999px; background:${pill.bg}; color:${pill.fg}; font-size:11px; font-weight:700;">${sanitize(c.status)}</div>
                          </div>
                          <div style="margin-top:2px; font-size: 12px; color:#64748b;">${sanitize(c.owner || c.email || "-")}</div>
                        </div>
                      </div>

                      <div style="margin-top: 10px; display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; font-size: 12px; color:#0f172a;">
                        <div><span style="color:#64748b;">Email:</span> ${sanitize(c.email || "-")}</div>
                        <div><span style="color:#64748b;">Phone:</span> ${sanitize(c.phone || "-")}</div>
                        <div><span style="color:#64748b;">Website:</span> ${sanitize(c.website || "-")}</div>
                        <div><span style="color:#64748b;">Address:</span> ${sanitize(c.address || "-")}</div>
                      </div>

                      ${chips ? `<div style=\"margin-top: 10px; display:flex; flex-wrap:wrap; gap: 6px;\">${chips}</div>` : ""}
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>

          <div style="margin-top: 18px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align:center; color:#64748b; font-size: 11px;">
            © ${new Date().getFullYear()} ${sanitize(pdfConfig.companyName)}
          </div>
        </div>
      `;

      document.body.appendChild(el);

      const file = `portfolio_${String(pdfConfig.companyName || "company").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      await html2pdf()
        .set({
          filename: file,
          margin: [0.4, 0.4, 0.4, 0.4],
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        })
        .from(el)
        .save();

      document.body.removeChild(el);
      toast.success("Portfolio PDF generated successfully");
      setOpenPdfExport(false);
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, animation: 'pulse 3s ease-in-out infinite'}} />
        <div className="relative px-6 py-12 sm:px-12 lg:px-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/80">
                <span className="text-white font-medium">Portfolio</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Client Portfolio
                  </h1>
                  <p className="mt-2 text-lg text-white/80">
                    Showcase our successful client relationships and testimonials
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Users className="w-3 h-3 mr-1" />
                  {clients.length} Clients
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Activity className="w-3 h-3 mr-1" />
                  {clients.filter(c => c.status === 'active').length} Active
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Target className="w-3 h-3 mr-1" />
                  {labels.length} Labels
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-white/90"
                onClick={() => setOpenPdfExport(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Portfolio PDF
              </Button>
              <Dialog open={openAddClient} onOpenChange={(v) => { setOpenAddClient(v); if (!v) setEditingClient(null); }}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner">Owner Name</Label>
                      <Input
                        id="owner"
                        value={formData.owner}
                        onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                        placeholder="Owner name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contact@company.com"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Full address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="labels">Labels</Label>
                      <Input
                        id="labels"
                        value={formData.labels}
                        onChange={(e) => setFormData(prev => ({ ...prev, labels: e.target.value }))}
                        placeholder="VIP, Enterprise, Long-term (comma separated)"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setOpenAddClient(false)}>
                      Cancel
                    </Button>
                    <Button onClick={editingClient ? updateClient : addClient}>
                      {editingClient ? "Update Client" : "Add Client"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={openPdfExport} onOpenChange={setOpenPdfExport}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Export Portfolio PDF</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Branding</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Company name</Label>
                          <Input value={pdfConfig.companyName} onChange={(e) => setPdfConfig((p) => ({ ...p, companyName: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <Label>Tagline</Label>
                          <Input value={pdfConfig.tagline} onChange={(e) => setPdfConfig((p) => ({ ...p, tagline: e.target.value }))} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Primary color</Label>
                          <Input type="color" value={pdfConfig.primaryColor} onChange={(e) => setPdfConfig((p) => ({ ...p, primaryColor: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <Label>Secondary color</Label>
                          <Input type="color" value={pdfConfig.secondaryColor} onChange={(e) => setPdfConfig((p) => ({ ...p, secondaryColor: e.target.value }))} />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={pdfConfig.includeStats}
                          onChange={(e) => setPdfConfig((p) => ({ ...p, includeStats: e.target.checked }))}
                        />
                        Include portfolio stats (total/active/inactive/labels)
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-medium">Download category</div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Status</Label>
                          <Select value={pdfConfig.status} onValueChange={(v: any) => setPdfConfig((p) => ({ ...p, status: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label>Labels</Label>
                          <div className="border rounded-md p-3 max-h-36 overflow-y-auto space-y-2">
                            {labels.length ? labels.map((l) => (
                              <label key={l} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={pdfConfig.labels.includes(l)}
                                  onChange={(e) => {
                                    setPdfConfig((p) => {
                                      const next = new Set(p.labels);
                                      if (e.target.checked) next.add(l);
                                      else next.delete(l);
                                      return { ...p, labels: Array.from(next) };
                                    });
                                  }}
                                />
                                {l}
                              </label>
                            )) : (
                              <div className="text-sm text-muted-foreground">No labels found</div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Leave empty to include all labels</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setOpenPdfExport(false)}>Cancel</Button>
                    <Button onClick={generatePortfolioPDF}><Download className="w-4 h-4 mr-2" />Generate PDF</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-12 lg:px-16 space-y-8">
        {/* Filters and Search */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search clients, owners, labels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={labelFilter} onValueChange={setLabelFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Labels</SelectItem>
                  {labels.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{client.displayName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{client.owner || client.email || "-"}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={client.status === 'active' ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{client.address}</span>
                  </div>
                  {client.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        {client.website}
                      </a>
                    </div>
                  )}
                </div>

                {client.labels.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Labels</span>
                    <div className="flex flex-wrap gap-1">
                      {client.labels.slice(0, 6).map((tag, index) => (
                        <Badge key={`${tag}-${index}`} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedClient(client);
                      setOpenTestimonial(true);
                    }}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateTestimonialPDF(client)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
                <div className="pt-1">
                  <Button asChild size="sm" className="w-full">
                    <Link to={`/clients/${client.id}`}>Open in CRM</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardContent className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || labelFilter !== "all" 
                  ? "Try adjusting your filters or search query"
                  : "Start by adding your first client to build your portfolio"
                }
              </p>
              <Button onClick={() => setOpenAddClient(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Client
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Client Details Modal */}
        <Dialog open={openTestimonial} onOpenChange={setOpenTestimonial}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Client Details - {selectedClient?.displayName}</DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Company Name</Label>
                    <p className="text-sm">{selectedClient.displayName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Owner Name</Label>
                    <p className="text-sm">{selectedClient.owner || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm">{selectedClient.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{selectedClient.email || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-sm">{selectedClient.address || "-"}</p>
                  </div>
                  {selectedClient.website && (
                    <div className="col-span-2">
                      <Label className="text-sm font-medium">Website</Label>
                      <a href={selectedClient.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {selectedClient.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={selectedClient.status === 'active' ? 'default' : 'outline'}>
                      {selectedClient.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Labels</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(selectedClient.labels || []).length ? (
                        selectedClient.labels.map((l, idx) => (
                          <Badge key={`${l}-${idx}`} variant="secondary">{l}</Badge>
                        ))
                      ) : (
                        <span className="text-sm">-</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => generateTestimonialPDF(selectedClient)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Testimonial PDF
                  </Button>
                  <Button asChild variant="outline">
                    <Link to={`/clients/${selectedClient.id}`}>Open in CRM</Link>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
