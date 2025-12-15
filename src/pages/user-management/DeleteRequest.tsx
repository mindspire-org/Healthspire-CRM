import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, RefreshCw, Settings, MoreHorizontal } from "lucide-react";

type Row = { id:number; name:string; role:string; requisition:string; request:string; reason:string; status:"Rejected"|"Pending" };
const rows: Row[] = [
  { id:1, name:"Darlee Robertson", role:"Facility Manager", requisition:"25 Sep 2025, 12:12 pm", request:"25 Sep 2025, 12:12 pm", reason:"No longer using service", status:"Rejected" },
  { id:2, name:"Sharon Roy", role:"Installer", requisition:"27 Sep 2025, 07:40 am", request:"27 Sep 2025, 07:40 am", reason:"Privacy concerns", status:"Pending" },
  { id:3, name:"Vaughan Lewis", role:"Senior Manager", requisition:"29 Sep 2025, 08:20 am", request:"29 Sep 2025, 08:20 am", reason:"Duplicate account", status:"Rejected" },
];

export default function DeleteRequest() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("-");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Delete Account Request</h1>
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

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button variant="outline">Filter</Button>
              <Button variant="outline">11 Nov 25 - 10 Dec 25</Button>
            </div>
            <div className="flex items-center gap-2">
              <Select>
                <SelectTrigger className="w-36"><SelectValue placeholder="Sort By"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Manage Columns</Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-8"><Checkbox /></TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Requisition Date</TableHead>
                <TableHead>Delete Request Date</TableHead>
                <TableHead>Reason for Deletion</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r)=> (
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
                  <TableCell>{r.requisition}</TableCell>
                  <TableCell>{r.request}</TableCell>
                  <TableCell className="text-muted-foreground">{r.reason}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'Pending' ? 'secondary' : 'destructive'}>{r.status}</Badge>
                  </TableCell>
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
