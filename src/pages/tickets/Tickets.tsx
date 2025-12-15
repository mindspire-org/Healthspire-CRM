import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Plus, RefreshCw, Search, Settings, Tags, Paperclip, Mic } from "lucide-react";

export default function Tickets() {
  const [tab, setTab] = useState("list");
  const [query, setQuery] = useState("");
  const [client, setClient] = useState("-");
  const [type, setType] = useState("-");
  const [label, setLabel] = useState("-");
  const [assigned, setAssigned] = useState("-");
  const [created, setCreated] = useState("-");
  const [status, setStatus] = useState("Status");
  const [selectedColor, setSelectedColor] = useState<string>("blue");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Tickets</h1>
        <div className="flex items-center gap-2">
          {/* Manage labels dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2"><Tags className="w-4 h-4"/> Manage labels</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage labels</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    "bg-lime-500","bg-green-500","bg-teal-500","bg-cyan-500","bg-slate-300",
                    "bg-orange-500","bg-amber-500","bg-red-500","bg-pink-500","bg-fuchsia-600",
                    "bg-sky-500","bg-slate-600","bg-blue-600","bg-violet-500","bg-purple-300",
                  ].map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(c)}
                      className={`h-6 w-6 rounded-full border ${c} ${selectedColor===c?"ring-2 ring-offset-2 ring-primary":""}`}
                      aria-label={`color-${i}`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <Label className="md:text-right text-muted-foreground">Label</Label>
                  <Input placeholder="Label" className="md:col-span-4" />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline">Close</Button>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Settings dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2"><Settings className="w-4 h-4"/> Settings</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <Label className="md:text-right pt-2 text-muted-foreground">Signature</Label>
                <Textarea placeholder="Signature" className="md:col-span-4 min-h-[120px]" />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline">Close</Button>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add ticket dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4"/> Add ticket</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <Label className="md:text-right text-muted-foreground">Title</Label>
                  <Input placeholder="Title" className="md:col-span-4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <Label className="md:text-right text-muted-foreground">Client</Label>
                  <Select value={client} onValueChange={setClient}>
                    <SelectTrigger className="md:col-span-4"><SelectValue placeholder="-"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <Label className="md:text-right text-muted-foreground">Requested by</Label>
                  <Select>
                    <SelectTrigger className="md:col-span-4"><SelectValue placeholder="Requested by"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <Label className="md:text-right text-muted-foreground">Ticket type</Label>
                  <Select>
                    <SelectTrigger className="md:col-span-4"><SelectValue placeholder="General Support"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                  <Label className="md:text-right pt-2 text-muted-foreground">Description</Label>
                  <Textarea placeholder="Description" className="md:col-span-4 min-h-[120px]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <Label className="md:text-right text-muted-foreground">Assign to</Label>
                  <Select>
                    <SelectTrigger className="md:col-span-4"><SelectValue placeholder="-"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <Label className="md:text-right text-muted-foreground">Labels</Label>
                  <Input placeholder="Labels" className="md:col-span-4" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="gap-2"><Paperclip className="w-4 h-4"/> Upload File</Button>
                  <Button variant="outline" size="icon" aria-label="voice"><Mic className="w-4 h-4"/></Button>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline">Close</Button>
                  <Button>Save</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex items-center justify-between mb-3">
              <TabsList className="bg-muted/40">
                <TabsTrigger value="list">Tickets list</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>
              {tab === "list" ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Excel</Button>
                  <Button variant="outline" size="sm">Print</Button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9 w-56" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9 w-56" />
                  </div>
                  {/* Add template dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2"><Plus className="w-4 h-4"/> Add template</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Add template</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <Label className="md:text-right text-muted-foreground">Title</Label>
                          <Input placeholder="Title" className="md:col-span-4" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                          <Label className="md:text-right pt-2 text-muted-foreground">Description</Label>
                          <Textarea placeholder="Description" className="md:col-span-4 min-h-[120px]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <Label className="md:text-right text-muted-foreground">Ticket type</Label>
                          <Select>
                            <SelectTrigger className="md:col-span-4"><SelectValue placeholder="-"/></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="-">-</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <Label className="md:text-right text-muted-foreground">Private</Label>
                          <div className="md:col-span-4 flex items-center gap-2">
                            <Checkbox id="private" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="gap-2">
                        <Button variant="outline">Close</Button>
                        <Button>Save</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>

            <TabsContent value="list">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Button variant="outline" size="icon" aria-label="grid">▦</Button>
                <Select value={client} onValueChange={setClient}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="- Client -"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">- Client -</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="- Ticket type -"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">- Ticket type -</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={label} onValueChange={setLabel}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="- Label -"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">- Label -</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={assigned} onValueChange={setAssigned}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="- Assigned to -"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">- Assigned to -</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={created} onValueChange={setCreated}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="- Created -"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">- Created -</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Status"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Status">Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="success" size="icon" aria-label="refresh"><RefreshCw className="w-4 h-4"/></Button>
                <Button variant="outline" size="icon" aria-label="clear">✕</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Ticket type</TableHead>
                    <TableHead>Labels</TableHead>
                    <TableHead>Assigned to</TableHead>
                    <TableHead>Last activity</TableHead>
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
            </TabsContent>

            <TabsContent value="templates">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Button variant="outline" size="icon" aria-label="grid">▦</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Private</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No record found.</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
