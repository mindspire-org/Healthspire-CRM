import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, RefreshCw, Search, Plus } from "lucide-react";

export default function Orders() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("-");
  const [pageSize, setPageSize] = useState("10");
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Orders</h1>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2"/>Add order</Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader><DialogTitle>Add order</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="space-y-1"><label className="text-sm">Client</label><Input placeholder="Client"/></div>
              <div className="space-y-1"><label className="text-sm">Amount</label><Input placeholder="0.00"/></div>
              <div className="space-y-1"><label className="text-sm">Order date</label><Input type="date"/></div>
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
              <Button variant="outline" size="icon"><Calendar className="w-4 h-4"/></Button>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Status -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Status -</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Order</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Invoices</TableHead>
                <TableHead>Order date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">No record found.</TableCell>
              </TableRow>
            </TableBody>
          </Table>

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
