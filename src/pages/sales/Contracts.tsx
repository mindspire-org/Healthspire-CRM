import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RefreshCw, Search, Plus, Paperclip, Mic } from "lucide-react";

export default function Contracts() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("-");
  const [pageSize, setPageSize] = useState("10");
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Contracts</h1>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2"/>Add contract</Button></DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader><DialogTitle>Add contract</DialogTitle></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-12">
              <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Title</div>
              <div className="sm:col-span-9"><Input placeholder="Title" /></div>

              <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Contract date</div>
              <div className="sm:col-span-9"><Input type="date" placeholder="Contract date" /></div>

              <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Valid until</div>
              <div className="sm:col-span-9"><Input type="date" placeholder="Valid until" /></div>

              <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Client/Lead</div>
              <div className="sm:col-span-9">
                <Select defaultValue="-">
                  <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Project</div>
              <div className="sm:col-span-9">
                <Select>
                  <SelectTrigger><SelectValue placeholder="Project" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">TAX</div>
              <div className="sm:col-span-9">
                <Select defaultValue="-">
                  <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Second TAX</div>
              <div className="sm:col-span-9">
                <Select defaultValue="-">
                  <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Note</div>
              <div className="sm:col-span-9"><Textarea placeholder="Note" className="min-h-[96px]" /></div>
            </div>

            <DialogFooter>
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm"><Paperclip className="w-4 h-4 mr-2"/>Upload File</Button>
                  <Button variant="outline" size="icon" className="rounded-full" aria-label="Record note"><Mic className="w-4 h-4"/></Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={()=>setOpenAdd(false)}>Close</Button>
                  <Button onClick={()=>setOpenAdd(false)}>Save</Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-36"><SelectValue placeholder="- Status -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Status -</SelectItem>
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
                <TableHead>Contract</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Contract date</TableHead>
                <TableHead>Valid until</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">No record found.</TableCell>
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
