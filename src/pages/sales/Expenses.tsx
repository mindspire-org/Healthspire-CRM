import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Upload, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export default function Expenses() {
  const [tab, setTab] = useState("list");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("-");
  const [member, setMember] = useState("-");
  const [project, setProject] = useState("-");
  const [openAdd, setOpenAdd] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  type RecRow = {
    id: string;
    date: string;
    category: string;
    title: string;
    description: string;
    files?: number;
    amount: string;
    tax: string;
    tax2: string;
    total: string;
  };

  const recurringRows: RecRow[] = useMemo(
    () => [
      {
        id: "r1",
        date: "2025-03-10",
        category: "Office Expense",
        title: "Office Rent",
        description:
          "30k pkr\nRepeat every: 1 Month(s)\nCycles: 0/12\nNext recurring: 2025-04-10",
        amount: "Rs.110",
        tax: "Rs.0",
        tax2: "Rs.0",
        total: "Rs.110",
      },
      {
        id: "r2",
        date: "2025-03-14",
        category: "Subscriptions",
        title: "Envato",
        description:
          "envato subscription = 900 monthly from social media buzz\nRepeat every: 1 Month(s)\nCycles: 0/5\nNext recurring: 2025-04-14",
        amount: "Rs.4",
        tax: "Rs.0",
        tax2: "Rs.0",
        total: "Rs.4",
      },
    ],
    []
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-sm text-muted-foreground">Expenses</h1>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-muted/40">
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={openImport} onOpenChange={setOpenImport}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-2"/>Import expense</Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader><DialogTitle>Import expense</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Input type="file" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpenImport(false)}>Close</Button>
                <Button onClick={()=>setOpenImport(false)}>Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2"/>Add expense</Button>
            </DialogTrigger>
            <DialogContent className="bg-card max-w-3xl">
              <DialogHeader><DialogTitle>Add expense</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-12">
                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Date</div>
                <div className="sm:col-span-9"><Input type="date" /></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Category</div>
                <div className="sm:col-span-9">
                  <Select defaultValue="-">
                    <SelectTrigger><SelectValue placeholder="- Category -"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">- Category -</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Member</div>
                <div className="sm:col-span-9">
                  <Select defaultValue="-">
                    <SelectTrigger><SelectValue placeholder="- Member -"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">- Member -</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Project</div>
                <div className="sm:col-span-9">
                  <Select defaultValue="-">
                    <SelectTrigger><SelectValue placeholder="- Project -"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">- Project -</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Title</div>
                <div className="sm:col-span-9"><Input placeholder="Title" /></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Description</div>
                <div className="sm:col-span-9"><Textarea placeholder="Description" className="min-h-[96px]" /></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Amount</div>
                <div className="sm:col-span-9"><Input placeholder="0.00" /></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">TAX</div>
                <div className="sm:col-span-9">
                  <Select defaultValue="-">
                    <SelectTrigger><SelectValue placeholder="-"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Second TAX</div>
                <div className="sm:col-span-9">
                  <Select defaultValue="-">
                    <SelectTrigger><SelectValue placeholder="-"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Category -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Category -</SelectItem>
                </SelectContent>
              </Select>
              <Select value={member} onValueChange={setMember}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Member -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Member -</SelectItem>
                </SelectContent>
              </Select>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Project -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Project -</SelectItem>
                </SelectContent>
              </Select>
              <div className="inline-flex items-center gap-2">
                <Button variant="outline" size="icon"><ChevronLeft className="w-4 h-4"/></Button>
                <span className="text-sm text-muted-foreground">December 2025</span>
                <Button variant="outline" size="icon"><ChevronRight className="w-4 h-4"/></Button>
                <Button variant="success" size="icon"><RefreshCw className="w-4 h-4"/></Button>
              </div>
              <Button variant="outline" size="sm">Monthly</Button>
              <Button variant="outline" size="sm">Yearly</Button>
              <Button variant="outline" size="sm">Custom</Button>
              <Button variant="outline" size="sm">Dynamic</Button>
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

          {tab === "list" ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>TAX</TableHead>
                  <TableHead>Second TAX</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">No record found.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>TAX</TableHead>
                  <TableHead>Second TAX</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurringRows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-primary underline cursor-pointer">{r.date}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell>{r.title}</TableCell>
                    <TableCell className="whitespace-pre-line text-muted-foreground">{r.description}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>{r.amount}</TableCell>
                    <TableCell>{r.tax}</TableCell>
                    <TableCell>{r.tax2}</TableCell>
                    <TableCell>{r.total}</TableCell>
                    <TableCell className="text-right">⋮</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between p-3 border-t mt-2">
            <div className="flex items-center gap-2 text-sm">
              <Select defaultValue="10">
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
