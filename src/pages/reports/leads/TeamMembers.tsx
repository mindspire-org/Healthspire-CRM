import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import ReportsNav from "../ReportsNav";

export default function LeadsTeamMembers() {
  const [source, setSource] = useState("-");
  const [label, setLabel] = useState("-");
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Leads</h1>
      </div>
      <ReportsNav />

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="icon">▦</Button>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Source -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Source -</SelectItem>
                </SelectContent>
              </Select>
              <Select value={label} onValueChange={setLabel}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Label -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Label -</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Created date</Button>
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
                <TableHead>Owner</TableHead>
                <TableHead>New</TableHead>
                <TableHead>Qualified</TableHead>
                <TableHead>Discussion</TableHead>
                <TableHead>Negotiation</TableHead>
                <TableHead>Won</TableHead>
                <TableHead>Lost</TableHead>
                <TableHead>Converted to client</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">No record found.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
