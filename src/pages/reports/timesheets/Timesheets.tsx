import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import ReportsNav from "../ReportsNav";

export default function TimesheetsReport() {
  const [member, setMember] = useState("-");
  const [project, setProject] = useState("-");
  const [client, setClient] = useState("-");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("details");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Timesheets</h1>
      </div>
      <ReportsNav />

      <Card>
        <CardContent className="p-4">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex items-center justify-between mb-3">
              <TabsList className="bg-muted/40">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="chart">Chart</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Excel</Button>
                <Button variant="outline" size="sm">Print</Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9 w-56" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Button variant="outline" size="icon">▦</Button>
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
              <Select value={client} onValueChange={setClient}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Client -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Client -</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" className="w-44" defaultValue={new Date().toISOString().slice(0,10)} />
              <span className="text-sm text-muted-foreground">Date</span>
              <Input type="date" className="w-44" defaultValue={new Date().toISOString().slice(0,10)} />
            </div>

            <TabsContent value="details">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Member</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Start time</TableHead>
                    <TableHead>End time</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">No record found.</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="summary">
              <div className="h-48 rounded-lg border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">Summary placeholder</div>
            </TabsContent>
            <TabsContent value="chart">
              <div className="h-64 rounded-lg border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">Chart placeholder</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
