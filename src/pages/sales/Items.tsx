import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Edit, X, Paperclip } from "lucide-react";

interface Item { id:number; title:string; desc:string; category:string; unit:string; rate:number; }
const seed: Item[] = [
  { id:1, title:"Website Redesign", desc:"", category:"-", unit:"", rate:250 },
  { id:2, title:"website development", desc:"web development for Umrah Website", category:"-", unit:"", rate:100 },
  { id:3, title:"website development", desc:"website development for glass/Aluminum website", category:"-", unit:"", rate:35000 },
  { id:4, title:"Website Design Polyfiber", desc:"", category:"-", unit:"", rate:25000 },
];

export default function Items() {
  const [items, setItems] = useState<Item[]>(seed);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("-");
  const [openAdd, setOpenAdd] = useState(false);

  const list = useMemo(()=> items.filter(i => i.title.toLowerCase().includes(query.toLowerCase())), [items, query]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Items</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Import items</Button>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2"/>Add item</Button></DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader><DialogTitle>Add item</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-12">
                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Title</div>
                <div className="sm:col-span-9"><Input placeholder="Title"/></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Description</div>
                <div className="sm:col-span-9"><Textarea placeholder="Description" className="min-h-[96px]"/></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Category</div>
                <div className="sm:col-span-9">
                  <Select defaultValue="general">
                    <SelectTrigger><SelectValue placeholder="General item" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General item</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Unit type</div>
                <div className="sm:col-span-9"><Input placeholder="Unit type (Ex: hours, pc, etc.)"/></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Rate</div>
                <div className="sm:col-span-9"><Input placeholder="Rate"/></div>

                <div className="sm:col-span-3 sm:text-right sm:pt-1 text-sm text-muted-foreground">Show in client portal</div>
                <div className="sm:col-span-9 flex items-center gap-2"><Checkbox id="showClient" /><label htmlFor="showClient" className="text-sm"> </label></div>
              </div>
              <DialogFooter>
                <div className="w-full flex items-center justify-between">
                  <Button variant="outline" size="sm"><Paperclip className="w-4 h-4 mr-2"/>Upload Image</Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={()=>setOpenAdd(false)}>Close</Button>
                    <Button onClick={()=>setOpenAdd(false)}>Save</Button>
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Category -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Category -</SelectItem>
                </SelectContent>
              </Select>
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
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit type</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead className="w-14"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((i)=> (
                <TableRow key={i.id}>
                  <TableCell className="text-primary underline cursor-pointer">{i.title}</TableCell>
                  <TableCell className="text-muted-foreground">{i.desc}</TableCell>
                  <TableCell>{i.category}</TableCell>
                  <TableCell>{i.unit}</TableCell>
                  <TableCell>{i.rate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm"><Edit className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon-sm"><X className="w-4 h-4"/></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
