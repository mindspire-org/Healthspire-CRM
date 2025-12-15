import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import ReportsNav from "../ReportsNav";

export default function LeadsConversions() {
  const [owner, setOwner] = useState("-");
  const [source, setSource] = useState("-");
  const [mode, setMode] = useState("Conversion date wise");
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
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Owner -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Owner -</SelectItem>
                </SelectContent>
              </Select>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="w-40"><SelectValue placeholder="- Source -"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">- Source -</SelectItem>
                </SelectContent>
              </Select>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Conversion date wise"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conversion date wise">Conversion date wise</SelectItem>
                </SelectContent>
              </Select>
              <div className="inline-flex items-center gap-2">
                <Button variant="outline" size="icon"><ChevronLeft className="w-4 h-4"/></Button>
                <span className="text-sm text-muted-foreground">December 2025</span>
                <Button variant="outline" size="icon"><ChevronRight className="w-4 h-4"/></Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9 w-56" />
              </div>
            </div>
          </div>

          <div className="h-64 rounded-lg border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
            Converted to client chart
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
