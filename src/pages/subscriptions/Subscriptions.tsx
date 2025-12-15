import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar, RefreshCw, Search, Plus, Tags } from "lucide-react";

export default function Subscriptions() {
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState("-");
  const [repeat, setRepeat] = useState("-");
  const [pageSize, setPageSize] = useState("10");
  const [openAdd, setOpenAdd] = useState(false);
  const [openLabels, setOpenLabels] = useState(false);

  // add subscription form (minimal)
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Subscriptions</h1>
        <div className="flex items-center gap-2">
          <Dialog open={openLabels} onOpenChange={setOpenLabels}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Tags className="w-4 h-4 mr-2"/>Manage labels</Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Manage labels</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-muted-foreground">Labels management coming soon.</div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpenLabels(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2"/>Add subscription</Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Add subscription</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="space-y-1"><Label>Title</Label><Input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} /></div>
                <div className="space-y-1"><Label>Client</Label><Input placeholder="Client" value={client} onChange={(e)=>setClient(e.target.value)} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1"><Label>First billing date</Label><Input type="date" /></div>
                  <div className="space-y-1"><Label>Repeat every</Label><Input placeholder="e.g. 1 month" /></div>
                  <div className="space-y-1"><Label>Amount</Label><Input placeholder="0.00" value={amount} onChange={(e)=>setAmount(e.target.value)} /></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpenAdd(false)}>Close</Button>
                <Button onClick={()=>setOpenAdd(false)}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="icon"><Calendar className="w-4 h-4"/></Button>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Currency -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Currency -</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="PKR">PKR</SelectItem>
                </SelectContent>
              </Select>
              <Select value={repeat} onValueChange={setRepeat}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Repeat type -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Repeat type -</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Next billing date</Button>
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

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Subscription ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>First billing date</TableHead>
                <TableHead>Next billing date</TableHead>
                <TableHead>Repeat every</TableHead>
                <TableHead>Cycles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">No record found.</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-3 border-t mt-2">
            <div className="flex items-center gap-2 text-sm">
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>0-0 / 0</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">‹</Button>
              <Button variant="outline" size="sm">›</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
