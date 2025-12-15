import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ReportsNav from "../ReportsNav";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TicketsStatistics() {
  const [type, setType] = useState("-");
  const [assigned, setAssigned] = useState("-");
  const [label, setLabel] = useState("-");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Tickets</h1>
      </div>
      <ReportsNav />

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-40"><SelectValue placeholder="- Ticket type -"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="-">- Ticket type -</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assigned} onValueChange={setAssigned}>
              <SelectTrigger className="w-40"><SelectValue placeholder="- Assigned to -"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="-">- Assigned to -</SelectItem>
              </SelectContent>
            </Select>
            <Select value={label} onValueChange={setLabel}>
              <SelectTrigger className="w-40"><SelectValue placeholder="- Label -"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="-">- Label -</SelectItem>
              </SelectContent>
            </Select>
            <div className="inline-flex items-center gap-2">
              <Button variant="outline" size="icon"><ChevronLeft className="w-4 h-4"/></Button>
              <span className="text-sm text-muted-foreground">December 2025</span>
              <Button variant="outline" size="icon"><ChevronRight className="w-4 h-4"/></Button>
            </div>
          </div>

          <div className="h-64 rounded-lg border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
            Ticket statistics chart
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
