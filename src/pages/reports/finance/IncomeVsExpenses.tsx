import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import ReportsNav from "../ReportsNav";

export default function IncomeVsExpenses() {
  const [project, setProject] = useState("-");
  const [year, setYear] = useState(2025);
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Income vs Expenses</h1>
      </div>
      <ReportsNav />

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Project"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">Project</SelectItem>
                </SelectContent>
              </Select>
              <div className="inline-flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Summary</span>
                <Button variant="outline" size="icon" onClick={()=>setYear(y=>y-1)}><ChevronLeft className="w-4 h-4"/></Button>
                <span className="text-sm text-muted-foreground">{year}</span>
                <Button variant="outline" size="icon" onClick={()=>setYear(y=>y+1)}><ChevronRight className="w-4 h-4"/></Button>
                <Button variant="success" size="icon"><RefreshCw className="w-4 h-4"/></Button>
              </div>
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

          <div className="h-64 rounded-lg border bg-muted/20 flex items-center justify-center text-muted-foreground text-sm">
            Chart placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
