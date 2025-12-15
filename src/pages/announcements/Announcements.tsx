import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { LayoutGrid, Search, Edit, X } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  createdBy: string;
  creatorInitials: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

const initialData: Announcement[] = [
  { id: 1, title: "Updated timing", createdBy: "HealthSpire", creatorInitials: "HS", startDate: "2025-04-08", endDate: "2025-04-30" },
  { id: 2, title: "Holiday Announcement", createdBy: "HealthSpire", creatorInitials: "HS", startDate: "2025-03-14", endDate: "2025-03-31" },
  { id: 3, title: "Working Announcement", createdBy: "HealthSpire", creatorInitials: "HS", startDate: "2025-03-12", endDate: "2025-03-31" },
];

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>(initialData);
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [openAdd, setOpenAdd] = useState(false);

  // form
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const list = useMemo(() => {
    const s = query.toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(s) || i.createdBy.toLowerCase().includes(s));
  }, [items, query]);

  const addItem = () => {
    if (!title.trim()) return;
    setItems((prev) => [
      { id: Math.floor(Math.random() * 100000), title: title.trim(), createdBy: "HealthSpire", creatorInitials: "HS", startDate: start || "2025-01-01", endDate: end || "2025-01-31" },
      ...prev,
    ]);
    setOpenAdd(false);
    setTitle(""); setStart(""); setEnd("");
  };

  const remove = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Announcements</h1>
        <div className="flex items-center gap-2">
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">Add announcement</Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Add announcement</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="space-y-1"><Label>Title</Label><Input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Start date</Label><Input type="date" value={start} onChange={(e)=>setStart(e.target.value)} /></div>
                  <div className="space-y-1"><Label>End date</Label><Input type="date" value={end} onChange={(e)=>setEnd(e.target.value)} /></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpenAdd(false)}>Close</Button>
                <Button onClick={addItem}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm">Print</Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9 w-56" />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4">
            
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Title</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Start date</TableHead>
                  <TableHead>End date</TableHead>
                  <TableHead className="w-14"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-primary underline cursor-pointer">{a.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-indigo text-white text-[10px]">{a.creatorInitials}</AvatarFallback>
                        </Avatar>
                        <span>{a.createdBy}</span>
                      </div>
                    </TableCell>
                    <TableCell>{a.startDate}</TableCell>
                    <TableCell>{a.endDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm"><Edit className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="icon-sm" onClick={()=>remove(a.id)}><X className="w-4 h-4"/></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-3 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>1-{Math.min(parseInt(pageSize), list.length)} / {list.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">‹</Button>
                <Button variant="outline" size="sm">›</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
