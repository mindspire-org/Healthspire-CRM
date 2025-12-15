import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import ReportsNav from "../ReportsNav";

export default function ExpensesSummary() {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Expenses summary</h1>
      </div>
      <ReportsNav />

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2">
                <Button variant="outline" size="icon"><ChevronLeft className="w-4 h-4"/></Button>
                <span className="text-sm text-muted-foreground">December 2025</span>
                <Button variant="outline" size="icon"><ChevronRight className="w-4 h-4"/></Button>
                <Button variant="success" size="icon"><RefreshCw className="w-4 h-4"/></Button>
              </div>
              <Button variant="outline" size="sm">Yearly</Button>
              <Button variant="outline" size="sm">Monthly</Button>
              <Button variant="outline" size="sm">Custom</Button>
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
                <TableHead>Category</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>TAX</TableHead>
                <TableHead>Second TAX</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No record found.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
