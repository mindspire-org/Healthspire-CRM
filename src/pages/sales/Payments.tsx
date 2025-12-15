import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RefreshCw, Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function Payments() {
  const [tab, setTab] = useState("list");
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("-");
  const [currency, setCurrency] = useState("-");
  const [project, setProject] = useState("-");
  const [openAdd, setOpenAdd] = useState(false);
  const [year, setYear] = useState(2025);

  // Chart data (demo)
  const chartMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const chartValues = useMemo(
    () => [0, 0, 1200, 600, 102000, 70000, 0, 140000, 47000, 0, 0, 32000],
    [year]
  );
  const maxVal = Math.max(1, ...chartValues);
  const prefix = currency === "PKR" ? "Rs." : currency === "EUR" ? "€" : currency === "USD" ? "$" : "";
  const fmt = (n: number) => `${prefix}${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)}`;
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 60);
    return () => {
      clearTimeout(t);
      setAnimate(false);
    };
  }, [year, currency]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm text-muted-foreground">Payment Received</h1>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-muted/40">
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2"/>Add payment</Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader><DialogTitle>Add payment</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="space-y-1"><label className="text-sm">Invoice ID</label><Input placeholder="INVOICE #..."/></div>
              <div className="space-y-1"><label className="text-sm">Payment date</label><Input type="date"/></div>
              <div className="space-y-1"><label className="text-sm">Payment method</label><Input placeholder="Bank Transfer"/></div>
              <div className="space-y-1"><label className="text-sm">Amount</label><Input placeholder="0.00"/></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>setOpenAdd(false)}>Close</Button>
              <Button onClick={()=>setOpenAdd(false)}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-44"><SelectValue placeholder="- Payment method -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Payment method -</SelectItem>
                </SelectContent>
              </Select>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-36"><SelectValue placeholder="- Currency -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Currency -</SelectItem>
                </SelectContent>
              </Select>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger className="w-36"><SelectValue placeholder="- Project -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Project -</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Monthly</Button>
              <Button variant="outline">Yearly</Button>
              <Button variant="outline">Custom</Button>
              <Button variant="outline">Dynamic</Button>
              <Button variant="outline">December 2025</Button>
              <Button variant="success" size="icon"><RefreshCw className="w-4 h-4"/></Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Excel</Button>
              <Button variant="outline" size="sm">Print</Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9 w-56" />
              </div>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsContent value="list">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Payment date</TableHead>
                        <TableHead>Payment method</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-primary underline cursor-pointer">INVOICE #20251244</TableCell>
                        <TableCell>2025-12-06</TableCell>
                        <TableCell>Bank Transfer</TableCell>
                        <TableCell>—</TableCell>
                        <TableCell>Rs.30,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Total</TableCell>
                        <TableCell colSpan={3}></TableCell>
                        <TableCell className="font-semibold">Rs.30,000</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="chart">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">Chart</div>
                    <div className="flex items-center gap-2">
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-36"><SelectValue placeholder="Currency"/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-">Currency</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="PKR">PKR</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="inline-flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => setYear((y) => y - 1)}><ChevronLeft className="w-4 h-4"/></Button>
                        <span className="w-16 text-center text-sm">{year}</span>
                        <Button variant="outline" size="icon" onClick={() => setYear((y) => y + 1)}><ChevronRight className="w-4 h-4"/></Button>
                      </div>
                    </div>
                  </div>

                  {/* Animated Bar Chart */}
                  <div className="relative h-72 rounded-lg border bg-muted/20 overflow-hidden">
                    {/* horizontal grid lines */}
                    {[0,1,2,3,4,5].map((i) => (
                      <div key={i} className="absolute left-0 right-0 border-t border-border/60" style={{ top: `${(i/5)*100}%` }} />
                    ))}

                    {/* bars */}
                    <div className="absolute left-4 right-4 bottom-8 top-4 flex items-end gap-3">
                      {chartValues.map((v, idx) => {
                        const h = Math.round((v / maxVal) * 100);
                        return (
                          <div key={idx} className="group relative flex-1 flex flex-col items-center">
                            <div className="relative w-6 rounded-sm bg-primary/30 group-hover:bg-primary/50 transition-all duration-700 ease-out" style={{ height: `${animate ? h : 0}%` }}>
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow">
                                {fmt(v)}
                              </div>
                            </div>
                            <div className="mt-2 text-[11px] text-muted-foreground">{chartMonths[idx]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
