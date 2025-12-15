import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import ReportsNav from "../ReportsNav";

export default function ProjectsTeamMembers() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("team");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Projects</h1>
      </div>
      <ReportsNav />

      <Card>
        <CardContent className="p-4">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex items-center justify-between mb-3">
              <TabsList className="bg-muted/40">
                <TabsTrigger value="team">Team members summary</TabsTrigger>
                <TabsTrigger value="clients">Clients summary</TabsTrigger>
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

            <div className="flex items-center gap-2 mb-3">
              <Button variant="outline" size="icon">▦</Button>
              <Button variant="outline">Project start date</Button>
            </div>

            <TabsContent value="team">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Team member</TableHead>
                    <TableHead>Open Projects</TableHead>
                    <TableHead>Completed Projects</TableHead>
                    <TableHead>Hold Projects</TableHead>
                    <TableHead>Open Tasks</TableHead>
                    <TableHead>Completed Tasks</TableHead>
                    <TableHead>Total time logged</TableHead>
                    <TableHead>Total time logged (Hours)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">No record found.</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="clients">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Client</TableHead>
                    <TableHead>Open Projects</TableHead>
                    <TableHead>Completed Projects</TableHead>
                    <TableHead>Hold Projects</TableHead>
                    <TableHead>Open Tasks</TableHead>
                    <TableHead>Completed Tasks</TableHead>
                    <TableHead>Total time logged</TableHead>
                    <TableHead>Total time logged (Hours)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">No record found.</TableCell>
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
