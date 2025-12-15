import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export default function Proposals() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("-");
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Proposals</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Excel</Button>
          <Button variant="outline" size="sm">Print</Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9 w-56" />
          </div>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2"/>Add proposal</Button></DialogTrigger>
            <DialogContent className="bg-card max-w-2xl">
              <DialogHeader><DialogTitle>Add proposal</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-12">
                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Proposal date</div>
                <div className="sm:col-span-9"><Input type="date" placeholder="Proposal date"/></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Valid until</div>
                <div className="sm:col-span-9"><Input type="date" placeholder="Valid until"/></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Client/Lead</div>
                <div className="sm:col-span-9">
                  <Select defaultValue="-">
                    <SelectTrigger><SelectValue placeholder="-"/></SelectTrigger>
                    <SelectContent><SelectItem value="-">-</SelectItem></SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">TAX</div>
                <div className="sm:col-span-9">
                  <Select defaultValue="-">
                    <SelectTrigger><SelectValue placeholder="-"/></SelectTrigger>
                    <SelectContent><SelectItem value="-">-</SelectItem></SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Second TAX</div>
                <div className="sm:col-span-9">
                  <Select defaultValue="-">
                    <SelectTrigger><SelectValue placeholder="-"/></SelectTrigger>
                    <SelectContent><SelectItem value="-">-</SelectItem></SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Note</div>
                <div className="sm:col-span-9"><Textarea placeholder="Note" className="min-h-[96px]"/></div>
              </div>
              <DialogFooter>
                <div className="w-full flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={()=>setOpenAdd(false)}>Close</Button>
                  <Button onClick={()=>setOpenAdd(false)}>Save</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="icon">▦</Button>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Status -" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Status -</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" className="w-44" placeholder="Last email seen" />
              <Input type="date" className="w-44" placeholder="Last preview seen" />
              <Button variant="outline" size="sm">Monthly</Button>
              <Button variant="outline" size="sm">Yearly</Button>
              <Button variant="outline" size="sm">Custom</Button>
              <Button variant="outline" size="sm">Dynamic</Button>
              <div className="inline-flex items-center gap-2">
                <Button variant="outline" size="icon"><ChevronLeft className="w-4 h-4"/></Button>
                <span className="text-sm text-muted-foreground">December 2025</span>
                <Button variant="outline" size="icon"><ChevronRight className="w-4 h-4"/></Button>
                <Button variant="success" size="icon"><RefreshCw className="w-4 h-4"/></Button>
              </div>
            </div>
            <div />
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Proposal</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Proposal date</TableHead>
                <TableHead>Valid until</TableHead>
                <TableHead>Last email seen</TableHead>
                <TableHead>Last preview seen</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">No record found.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
