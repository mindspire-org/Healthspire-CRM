import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Download } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const API_BASE = "http://localhost:5000";

interface Row {
  id: string;
  employee: string;
  basic: number;
  allowances: number;
  deductions: number;
  net: number;
  status: "draft" | "processed" | "paid";
  period: string; // YYYY-MM
}

export default function Payroll() {
  const [rows, setRows] = useState<Row[]>([]);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0,7));
  const [query, setQuery] = useState("");
  const [openRun, setOpenRun] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const url = `${API_BASE}/api/payroll?period=${encodeURIComponent(period)}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const mapped: Row[] = (Array.isArray(data) ? data : []).map((d: any) => ({
            id: String(d._id || ""),
            employee: d.employee || "-",
            basic: Number(d.basic || 0),
            allowances: Number(d.allowances || 0),
            deductions: Number(d.deductions || 0),
            net: Number(d.net || 0),
            status: (d.status as any) || "draft",
            period: d.period || period,
          }));
          setRows(mapped);
        }
      } catch {}
    })();
  }, [period, query]);

  const runPayroll = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/payroll/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        const mapped: Row[] = items.map((d: any) => ({
          id: String(d._id || ""),
          employee: d.employee || "-",
          basic: Number(d.basic || 0),
          allowances: Number(d.allowances || 0),
          deductions: Number(d.deductions || 0),
          net: Number(d.net || 0),
          status: (d.status as any) || "draft",
          period: d.period || period,
        }));
        setRows(mapped);
        toast.success(`Payroll processed for ${period}`);
      }
    } catch {}
  };

  const list = useMemo(() => {
    const s = query.toLowerCase();
    return rows.filter((r) => r.employee.toLowerCase().includes(s) && r.period === period);
  }, [rows, query, period]);

  const statusBadge = (st: Row["status"]) => (
    st === "paid" ? <Badge variant="success">Paid</Badge> : st === "processed" ? <Badge variant="secondary">Processed</Badge> : <Badge>Draft</Badge>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Payroll</h1>
        <div className="flex items-center gap-2">
          <Dialog open={openRun} onOpenChange={setOpenRun}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="sm">Run payroll</Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Run payroll</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label>Period</Label>
                  <Input placeholder="YYYY-MM" value={period} onChange={(e)=>setPeriod(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Notes</Label>
                  <Input placeholder="Optional" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpenRun(false)}>Close</Button>
                <Button onClick={async ()=>{ await runPayroll(); setOpenRun(false); }}>Process</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2"/>Export</Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9 w-56" />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Tabs defaultValue="current">
              <TabsList className="bg-muted/40 flex flex-wrap gap-1">
                <TabsTrigger value="current">Current period</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Period</Label>
              <Input className="w-32" placeholder="YYYY-MM" value={period} onChange={(e)=>setPeriod(e.target.value)} />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Employee</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.employee}</TableCell>
                  <TableCell>${r.basic.toLocaleString()}</TableCell>
                  <TableCell>${r.allowances.toLocaleString()}</TableCell>
                  <TableCell>${r.deductions.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">${r.net.toLocaleString()}</TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell className="text-right">⋮</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
