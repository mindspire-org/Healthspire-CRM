import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ChevronDown, RefreshCw, Settings, MoreHorizontal } from "lucide-react";

type Row = { id:number; name:string; role:string; phone:string; email:string; created:string; last:string; status:"Active"|"Inactive" };

const sample: Row[] = [
  { id:1, name:"Darlee Robertson", role:"Facility Manager", phone:"1234567890", email:"robertson@example.com", created:"25 Sep 2025, 12:12 pm", last:"2 mins ago", status:"Active" },
  { id:2, name:"Sharon Roy", role:"Installer", phone:"+1 989757485", email:"sharon@example.com", created:"27 Sep 2025, 07:40 am", last:"5 mins ago", status:"Inactive" },
  { id:3, name:"Vaughan Lewis", role:"Senior Manager", phone:"+1 546555455", email:"vaughan12@example.com", created:"29 Sep 2025, 08:20 am", last:"2 days ago", status:"Active" },
];

export default function ManageUsers() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("-");
  const [status, setStatus] = useState("-");
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Manage Users</h1>
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
            <DialogTrigger asChild><Button className="bg-red-500 hover:bg-red-500/90" size="sm"><Plus className="w-4 h-4 mr-2"/>Add User</Button></DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader><DialogTitle>Add user</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Input placeholder="Full name" />
                <Input placeholder="Email" />
                <Input placeholder="Password" type="password" />
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
            <div className="flex items-center gap-2">
              <Button variant="outline">Filter</Button>
              <Button variant="outline">11 Nov 25 - 10 Dec 25</Button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Checkbox />
            </div>
            <div className="flex items-center gap-2">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Sort By"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Manage Columns</Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-8"><Checkbox /></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sample.map((r)=> (
                <TableRow key={r.id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback>{r.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</AvatarFallback></Avatar>
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{r.phone}</TableCell>
                  <TableCell className="text-muted-foreground">{r.email}</TableCell>
                  <TableCell>{r.role}</TableCell>
                  <TableCell>{r.created}</TableCell>
                  <TableCell>{r.last}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'Active' ? 'success' : 'destructive'}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm"><MoreHorizontal className="w-4 h-4"/></Button>
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
