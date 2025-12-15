import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, ChevronDown, RefreshCw, Settings, MoreHorizontal } from "lucide-react";

type RoleRow = { id:number; name:string; created:string };
const rows: RoleRow[] = [
  { id:1, name:"Admin", created:"25 Sep 2025, 12:12 pm" },
  { id:2, name:"Company Owner", created:"27 Sep 2025, 07:40 am" },
  { id:3, name:"Deal Owner", created:"29 Sep 2025, 08:20 am" },
  { id:4, name:"Project Manager", created:"25 Sep 2025, 12:12 pm" },
  { id:5, name:"Client", created:"15 Oct 2025, 06:18 pm" },
];

export default function RolesPermissions() {
  const [query, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Roles & Permissions</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Export <ChevronDown className="w-4 h-4 ml-2"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>CSV</DropdownMenuItem>
              <DropdownMenuItem>Excel</DropdownMenuItem>
              <DropdownMenuItem>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon"><RefreshCw className="w-4 h-4"/></Button>
          <Button variant="outline" size="icon"><Settings className="w-4 h-4"/></Button>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild><Button className="bg-red-500 hover:bg-red-500/90" size="sm"><Plus className="w-4 h-4 mr-2"/>Add New Role</Button></DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader><DialogTitle>Add role</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Input placeholder="Role name" />
                <Input placeholder="Description" />
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
          <div className="flex items-center justify-between mb-3">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-8"><Checkbox /></TableHead>
                <TableHead>Role Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r)=> (
                <TableRow key={r.id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.created}</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon-sm"><MoreHorizontal className="w-4 h-4"/></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
