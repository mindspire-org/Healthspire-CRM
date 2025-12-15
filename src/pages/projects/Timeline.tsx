import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Calendar, RefreshCw, Plus } from "lucide-react";

interface TaskBar {
  id: string;
  title: string;
  start: string; // yyyy-mm-dd
  end: string;   // yyyy-mm-dd
}

const API_BASE = "http://localhost:5000";

export default function Timeline() {
  const [groupBy, setGroupBy] = useState("none");
  const [project, setProject] = useState("-");
  const [assignee, setAssignee] = useState("-");
  const [milestone, setMilestone] = useState("-");
  const [bars, setBars] = useState<TaskBar[]>([]);

  const [now, setNow] = useState(new Date());
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = now.toLocaleString(undefined, { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    (async () => {
      try {
        // Use projects as bars (start -> deadline)
        const res = await fetch(`${API_BASE}/api/projects`);
        if (!res.ok) return;
        const data = await res.json();
        const mapped: TaskBar[] = (Array.isArray(data) ? data : [])
          .filter((d: any) => d.start && d.deadline)
          .map((d: any) => ({
            id: String(d._id || ""),
            title: d.title || "-",
            start: new Date(d.start).toISOString().slice(0,10),
            end: new Date(d.deadline).toISOString().slice(0,10),
          }));
        setBars(mapped);
      } catch {}
    })();
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-display text-2xl text-foreground">Gantt</span>
        </div>
        <Button variant="gradient"><Plus className="w-4 h-4 mr-2"/>Add task</Button>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon"><RefreshCw className="w-4 h-4"/></Button>
          <Select value={groupBy} onValueChange={setGroupBy}><SelectTrigger className="w-40"><SelectValue placeholder="- Group by -"/></SelectTrigger><SelectContent><SelectItem value="none">- Group by -</SelectItem></SelectContent></Select>
          <Select value={project} onValueChange={setProject}><SelectTrigger className="w-40"><SelectValue placeholder="- Project -"/></SelectTrigger><SelectContent><SelectItem value="-">- Project -</SelectItem></SelectContent></Select>
          <Select value={assignee} onValueChange={setAssignee}><SelectTrigger className="w-40"><SelectValue placeholder="- Assigned to -"/></SelectTrigger><SelectContent><SelectItem value="-">- Assigned to -</SelectItem></SelectContent></Select>
          <Select value={milestone} onValueChange={setMilestone}><SelectTrigger className="w-40"><SelectValue placeholder="- Milestone -"/></SelectTrigger><SelectContent><SelectItem value="-">- Milestone -</SelectItem></SelectContent></Select>
          <div className="ml-auto">
            <Button variant="outline" size="sm">Days view</Button>
          </div>
        </div>
      </Card>

      {/* Timeline grid */}
      <Card className="p-0 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header calendar row */}
            <div className="grid" style={{ gridTemplateColumns: `120px repeat(${days.length}, minmax(24px,1fr))` }}>
              <div className="bg-muted/40 p-2 text-sm text-muted-foreground">{monthLabel}</div>
              {days.map(d => (
                <div key={d} className="bg-muted/40 p-2 text-xs text-muted-foreground text-center">{String(d).padStart(2,'0')}</div>
              ))}
            </div>

            {/* Bars */}
            {bars.map((b, row) => {
              const sDate = new Date(b.start);
              const eDate = new Date(b.end);
              if (sDate.getMonth() !== month || eDate.getMonth() !== month) return null; // simple month filter
              const start = sDate.getDate();
              const end = eDate.getDate();
              const span = Math.max(1, end - start + 1);
              return (
                <div key={b.id} className="grid border-t" style={{ gridTemplateColumns: `120px repeat(${days.length}, minmax(24px,1fr))` }}>
                  <div className="p-2 text-sm text-muted-foreground flex items-center">{b.title}</div>
                  {/* empty cells before bar */}
                  {Array.from({ length: start - 1 }).map((_, i) => (
                    <div key={`e-${row}-${i}`} className="h-8" />
                  ))}
                  <div className="h-8 my-2 rounded bg-primary/80 text-primary-foreground flex items-center justify-center text-xs" style={{ gridColumn: `span ${span}` }}>
                    {b.title}
                  </div>
                  {Array.from({ length: days.length - (start - 1) - span }).map((_, i) => (
                    <div key={`t-${row}-${i}`} className="h-8" />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
