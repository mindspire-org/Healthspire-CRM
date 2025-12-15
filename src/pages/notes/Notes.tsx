import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Tags, Plus, RefreshCw, MoreHorizontal, Clock } from "lucide-react";

export default function Notes() {
  const [tab, setTab] = useState("list");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("-");
  const [label, setLabel] = useState("-");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const notes = [
    {
      title: "Guidance File",
      created: "2025-03-21 10:54:18 am",
      excerpt:
        "data need to take from: https://www.gracecovenant-church.com/\n\n the tabs I have prebuilt are...",
    },
    {
      title: "wordpress login details",
      created: "2025-03-21 10:52:09 am",
      excerpt:
        "https://orange-herring-379657.hostingsite.com/wp-admin/\nQutalbahatlat (TO)&0h372poTv6PQ%3vfk5",
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Notes (Private)</h1>
        <div className="flex items-center gap-2">
          {tab !== "categories" ? (
            <>
              {/* Manage labels */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2"><Tags className="w-4 h-4"/> Manage labels</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Manage labels</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <Label className="md:text-right text-muted-foreground">Label</Label>
                    <Input placeholder="Label" className="md:col-span-4" />
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline">Close</Button>
                    <Button>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Add note */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2"><Plus className="w-4 h-4"/> Add note</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add note</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <Label className="md:text-right text-muted-foreground">Title</Label>
                      <Input placeholder="Title" className="md:col-span-4" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <Label className="md:text-right text-muted-foreground">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="md:col-span-4"><SelectValue placeholder="-"/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-">-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                      <Label className="md:text-right pt-2 text-muted-foreground">Description</Label>
                      <Textarea placeholder="Description" className="md:col-span-4 min-h-[140px]" />
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
            </>
          ) : (
            // Add category
            <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4"/> Add category</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add category</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <Label className="md:text-right text-muted-foreground">Name</Label>
                  <Input placeholder="Name" className="md:col-span-4" />
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setShowAddCategory(false)}>Close</Button>
                  <Button onClick={() => setShowAddCategory(false)}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex items-center justify-between mb-3">
              <TabsList className="bg-muted/40">
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9 w-56" />
                </div>
              </div>
            </div>

            <TabsContent value="list">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Button variant="outline" size="icon" aria-label="grid">▦</Button>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="- Category -"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">- Category -</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={label} onValueChange={setLabel}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="- Label -"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">- Label -</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="success" size="icon" aria-label="refresh"><RefreshCw className="w-4 h-4"/></Button>
                <Button variant="outline" size="icon" aria-label="clear">✕</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Created date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2025-03-21 10:54:18 am</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 text-primary hover:underline cursor-pointer">
                        <span className="h-2 w-2 rounded-full bg-primary"></span>
                        Guidance File
                      </span>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right">⋮</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-03-21 10:52:09 am</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 text-primary hover:underline cursor-pointer">
                        <span className="h-2 w-2 rounded-full bg-primary"></span>
                        wordpress login details
                      </span>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right">⋮</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="grid">
              {/* Toolbar for grid */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Button variant="outline" size="icon" aria-label="refresh"><RefreshCw className="w-4 h-4"/></Button>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="- Category -"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">- Category -</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={label} onValueChange={setLabel}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="- Label -"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">- Label -</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="success" size="icon" aria-label="refresh"><RefreshCw className="w-4 h-4"/></Button>
                <Button variant="outline" size="icon" aria-label="clear">✕</Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((n, idx) => (
                  <div key={idx} className="rounded-lg border bg-blue-50 border-blue-200 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-blue-900">{n.title}</h3>
                      <MoreHorizontal className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-700 mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{n.created}</span>
                    </div>
                    <p className="text-sm text-blue-800/90 line-clamp-4 whitespace-pre-wrap">{n.excerpt}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" aria-label="grid">▦</Button>
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
                    <TableHead>Name</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">No record found.</TableCell>
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
