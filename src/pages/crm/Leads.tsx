import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  Edit,
  Trash2,
  LayoutGrid,
  List,
  ArrowUpDown,
  RefreshCw,
  Check,
  X,
  Tags,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Lead = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  source: string;
  value: string;
  lastContact: string;
  initials: string;
};

const leads: Lead[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    company: "Tech Solutions Inc",
    email: "sarah@techsolutions.com",
    phone: "+1 (555) 123-4567",
    status: "qualified",
    source: "Website",
    value: "$45,000",
    lastContact: "2 hours ago",
    initials: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    company: "Digital Dynamics",
    email: "m.chen@digitaldyn.com",
    phone: "+1 (555) 234-5678",
    status: "proposal",
    source: "LinkedIn",
    value: "$28,500",
    lastContact: "1 day ago",
    initials: "MC",
  },
  {
    id: 3,
    name: "Emily Davis",
    company: "Growth Partners",
    email: "emily@growthpartners.io",
    phone: "+1 (555) 345-6789",
    status: "new",
    source: "Referral",
    value: "$32,000",
    lastContact: "3 days ago",
    initials: "ED",
  },
  {
    id: 4,
    name: "Robert Wilson",
    company: "Innovate Labs",
    email: "rwilson@innovatelabs.co",
    phone: "+1 (555) 456-7890",
    status: "contacted",
    source: "Trade Show",
    value: "$18,750",
    lastContact: "1 week ago",
    initials: "RW",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    company: "Future Vision",
    email: "l.anderson@futurevision.com",
    phone: "+1 (555) 567-8901",
    status: "won",
    source: "Cold Call",
    value: "$62,000",
    lastContact: "2 weeks ago",
    initials: "LA",
  },
  {
    id: 6,
    name: "David Martinez",
    company: "Smart Systems",
    email: "d.martinez@smartsys.io",
    phone: "+1 (555) 678-9012",
    status: "lost",
    source: "Website",
    value: "$15,000",
    lastContact: "1 month ago",
    initials: "DM",
  },
];

const statusConfig = {
  new: { label: "New", variant: "default" as const },
  contacted: { label: "Contacted", variant: "secondary" as const },
  qualified: { label: "Qualified", variant: "default" as const },
  proposal: { label: "Proposal", variant: "warning" as const },
  won: { label: "Won", variant: "success" as const },
  lost: { label: "Lost", variant: "destructive" as const },
};

export default function Leads() {
  const [items, setItems] = useState<Lead[]>(leads);
  const [searchQuery, setSearchQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);

  // add lead form state
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [owner, setOwner] = useState("HealthSpire");
  const [labelText, setLabelText] = useState("");
  const [created, setCreated] = useState("");
  const [status, setStatus] = useState<Lead["status"]>("new");
  const [source, setSource] = useState("Website");
  const uploadRef = useRef<HTMLInputElement>(null);

  const filteredLeads = useMemo(() => {
    const s = searchQuery.toLowerCase();
    return items.filter((lead) => lead.name.toLowerCase().includes(s) || lead.company.toLowerCase().includes(s));
  }, [items, searchQuery]);

  const saveLead = (show: boolean) => {
    if (!name.trim()) return;
    const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    setItems((prev) => [
      {
        id: Math.floor(Math.random() * 100000),
        name: name.trim(),
        company: company || "-",
        email,
        phone,
        status,
        source,
        value: "-",
        lastContact: created || "today",
        initials,
      },
      ...prev,
    ]);
    toast.success("Lead created");
    if (!show) setOpenAdd(false);
  };

  // Map to kanban columns from screenshots
  const columns = [
    { id: "new", title: "New", color: "bg-amber-400" },
    { id: "qualified", title: "Qualified", color: "bg-blue-500" },
    { id: "discussion", title: "Discussion", color: "bg-teal-500" },
    { id: "negotiation", title: "Negotiation", color: "bg-primary" },
    { id: "won", title: "Won", color: "bg-green-500" },
    { id: "lost", title: "Lost", color: "bg-rose-500" },
  ] as const;

  const kanbanGroups: Record<string, Lead[]> = {
    new: items.filter((l) => l.status === "new"),
    qualified: items.filter((l) => l.status === "qualified"),
    discussion: items.filter((l) => l.status === "contacted"),
    negotiation: items.filter((l) => l.status === "proposal"),
    won: items.filter((l) => l.status === "won"),
    lost: items.filter((l) => l.status === "lost"),
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          <h1 className="text-2xl font-bold font-display">Leads</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Tags className="w-4 h-4 mr-2"/>Manage labels</Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-2"/>Import leads</Button>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button variant="gradient"><Plus className="w-4 h-4 mr-2"/>Add lead</Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Add lead</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="space-y-1"><Label>Title</Label><Input placeholder="Title" value={name} onChange={(e)=>setName(e.target.value)} /></div>
                <div className="space-y-1"><Label>Company</Label><Input placeholder="Company name" value={company} onChange={(e)=>setCompany(e.target.value)} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Email</Label><Input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Phone</Label><Input placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Owner</Label><Select value={owner} onValueChange={setOwner}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="HealthSpire">HealthSpire</SelectItem><SelectItem value="John Doe">John Doe</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><Label>Labels</Label><Input placeholder="Labels" value={labelText} onChange={(e)=>setLabelText(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Status</Label><Select value={status} onValueChange={(v)=>setStatus(v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusConfig).map(([k,c])=> (<SelectItem key={k} value={k}>{c.label}</SelectItem>))}</SelectContent></Select></div>
                  <div className="space-y-1"><Label>Source</Label><Select value={source} onValueChange={setSource}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Website">Website</SelectItem><SelectItem value="LinkedIn">LinkedIn</SelectItem><SelectItem value="Referral">Referral</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-1"><Label>Created date</Label><Input type="date" placeholder="YYYY-MM-DD" value={created} onChange={(e)=>setCreated(e.target.value)} /></div>
              </div>
              <DialogFooter>
                <div className="flex-1"><input ref={uploadRef} type="file" className="hidden" /><Button variant="outline" type="button" onClick={()=>uploadRef.current?.click()}>Upload File</Button></div>
                <Button variant="outline" onClick={()=>setOpenAdd(false)}>Close</Button>
                <Button variant="gradient" onClick={()=>saveLead(true)}>Save & show</Button>
                <Button onClick={()=>saveLead(false)}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>

        {/* Filter toolbar */}
        <Card className="p-3 mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon"><RefreshCw className="w-4 h-4"/></Button>
            <Select><SelectTrigger className="w-40"><SelectValue placeholder="- Owner -"/></SelectTrigger><SelectContent><SelectItem value="-">- Owner -</SelectItem></SelectContent></Select>
            <Select><SelectTrigger className="w-40"><SelectValue placeholder="- Status -"/></SelectTrigger><SelectContent>{Object.entries(statusConfig).map(([k,c])=> (<SelectItem key={k} value={k}>{c.label}</SelectItem>))}</SelectContent></Select>
            <Select><SelectTrigger className="w-40"><SelectValue placeholder="- Label -"/></SelectTrigger><SelectContent><SelectItem value="-">- Label -</SelectItem></SelectContent></Select>
            <Select><SelectTrigger className="w-40"><SelectValue placeholder="- Source -"/></SelectTrigger><SelectContent><SelectItem value="Website">Website</SelectItem><SelectItem value="LinkedIn">LinkedIn</SelectItem><SelectItem value="Referral">Referral</SelectItem></SelectContent></Select>
            <Button variant="outline">Created date</Button>
            <Button variant="success" size="icon"><Check className="w-4 h-4"/></Button>
            <Button variant="outline" size="icon"><X className="w-4 h-4"/></Button>
            <div className="ml-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9 w-64" placeholder="Search" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} />
            </div>
          </div>
        </Card>

        {/* List */}
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Primary contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Labels</TableHead>
                    <TableHead>Created date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="whitespace-nowrap text-primary underline cursor-pointer">{lead.name}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{lead.company}</TableCell>
                      <TableCell className="whitespace-nowrap">{lead.phone || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap text-primary">HealthSpire</TableCell>
                      <TableCell className="whitespace-nowrap">-</TableCell>
                      <TableCell className="whitespace-nowrap">{lead.lastContact}</TableCell>
                      <TableCell className="whitespace-nowrap"><Badge variant={statusConfig[lead.status].variant}>{statusConfig[lead.status].label}</Badge></TableCell>
                      <TableCell className="text-right opacity-60">⋮</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kanban */}
        <TabsContent value="kanban" className="mt-4">
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
            {columns.map((c) => (
              <div key={c.id} className="flex-shrink-0 w-[320px]">
                <Card className="h-full">
                  <CardHeader className="p-4 pb-2">
                    <div className="text-sm font-medium">{c.title}</div>
                    <div className={cn("h-0.5 mt-2 rounded", c.color)} />
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3 min-h-[280px]">
                    {kanbanGroups[c.id]?.map((lead) => (
                      <div key={lead.id} className="kanban-card">
                        <div className="font-medium text-sm truncate">{lead.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{lead.source}</div>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <span>📎 1</span>
                          <span>🗂️ 2</span>
                          <span className="inline-flex items-center gap-1"><span className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-indigo inline-block" /></span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
