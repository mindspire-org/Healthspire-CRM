import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Mail,
  Printer,
  FileText,
  HelpCircle,
  Paperclip,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import { useState } from "react";

type ListInvoice = {
  id: string;
  client: string;
  project?: string;
  billDate: string;
  dueDate: string;
  totalInvoiced: string;
  paymentReceived: string;
  due: string;
  status: "Paid" | "Partially paid" | "Unpaid";
  advancedAmount?: string;
};

const listRows: ListInvoice[] = [
  {
    id: "INVOICE #20251244",
    client: "Polyfiber",
    project: "Estimate: 2025055",
    billDate: "2025-12-06",
    dueDate: "2025-12-20",
    totalInvoiced: "Rs.40,000",
    paymentReceived: "Rs.30,000",
    due: "Rs.10,000",
    status: "Partially paid",
    advancedAmount: "20000",
  },
];

export default function InvoiceList() {
  const [tab, setTab] = useState("list");
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-sm text-muted-foreground">Invoices</h1>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-muted/40">
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" size="sm">Manage labels</Button></DialogTrigger>
            <DialogContent className="bg-card"><DialogHeader><DialogTitle>Manage labels</DialogTitle></DialogHeader><DialogFooter><Button variant="outline">Close</Button></DialogFooter></DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" size="sm">Add payment</Button></DialogTrigger>
            <DialogContent className="bg-card"><DialogHeader><DialogTitle>Add payment</DialogTitle></DialogHeader><DialogFooter><Button variant="outline">Close</Button><Button>Save</Button></DialogFooter></DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2"/>Add invoice</Button></DialogTrigger>
            <DialogContent className="bg-card max-w-3xl">
              <DialogHeader><DialogTitle>Add invoice</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-12">
                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Bill date</div>
                <div className="sm:col-span-9"><Input type="date" defaultValue={new Date().toISOString().slice(0,10)} /></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Due date</div>
                <div className="sm:col-span-9"><Input type="date" /></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Client</div>
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

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">TDS</div>
                <div className="sm:col-span-9">
                  <Select defaultValue="-">
                    <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground flex items-center gap-1">Recurring <HelpCircle className="w-3 h-3 text-muted-foreground"/></div>
                <div className="sm:col-span-9 flex items-center gap-2"><Checkbox id="recurring" /><label htmlFor="recurring" className="text-sm"></label></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Note</div>
                <div className="sm:col-span-9"><Textarea placeholder="Note" className="min-h-[96px]" /></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Labels</div>
                <div className="sm:col-span-9"><Input placeholder="Labels" /></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Advanced Amount</div>
                <div className="sm:col-span-9"><Input placeholder="Advanced Amount" /></div>
              </div>
              <DialogFooter>
                <div className="w-full flex items-center justify-between">
                  <Button variant="outline" size="sm"><Paperclip className="w-4 h-4 mr-2"/>Upload File</Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">Close</Button>
                    <Button>Save</Button>
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <Select>
                <SelectTrigger className="w-36"><SelectValue placeholder="- Type -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Type -</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-36"><SelectValue placeholder="- Status -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Status -</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-36"><SelectValue placeholder="- Currency -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Currency -</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Monthly</Button>
              <Button variant="outline">Yearly</Button>
              <Button variant="outline">Custom</Button>
              <Button variant="outline">Dynamic</Button>
              <Button variant="outline">December 2025</Button>
              <Button variant="success" size="sm">↻</Button>
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

          <Tabs value={tab} onValueChange={setTab} className="mt-4">
            <TabsContent value="list">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Bill date</TableHead>
                        <TableHead>Due date</TableHead>
                        <TableHead>Total invoiced</TableHead>
                        <TableHead>Payment Received</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Advanced Amount</TableHead>
                        <TableHead className="w-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listRows.map((r)=> (
                        <TableRow key={r.id}>
                          <TableCell className="text-primary underline cursor-pointer">{r.id}</TableCell>
                          <TableCell>{r.client}</TableCell>
                          <TableCell>{r.project || "-"}</TableCell>
                          <TableCell>{r.billDate}</TableCell>
                          <TableCell>{r.dueDate}</TableCell>
                          <TableCell>{r.totalInvoiced}</TableCell>
                          <TableCell>{r.paymentReceived}</TableCell>
                          <TableCell>{r.due}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === 'Paid' ? 'success' : r.status === 'Partially paid' ? 'secondary' : 'destructive'}>{r.status}</Badge>
                          </TableCell>
                          <TableCell>{r.advancedAmount || '-'}</TableCell>
                          <TableCell className="text-right">⋮</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-medium">Total</TableCell>
                        <TableCell colSpan={4}></TableCell>
                        <TableCell className="font-semibold">Rs.40,000</TableCell>
                        <TableCell className="font-semibold">Rs.30,000</TableCell>
                        <TableCell className="font-semibold">Rs.10,000</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recurring">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Next recurring</TableHead>
                        <TableHead>Repeat every</TableHead>
                        <TableHead>Cycles</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total invoiced</TableHead>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
