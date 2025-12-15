import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, BookOpen } from "lucide-react";

export default function KnowledgeBaseCategories() {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold flex items-center gap-2"><BookOpen className="w-5 h-5"/> Knowledge base - Categories</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9 w-64" />
          </div>
          <Dialog>
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
                <Button variant="outline">Close</Button>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Name</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">No record found.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
