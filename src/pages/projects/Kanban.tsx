import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  MoreHorizontal,
  MessageSquare,
  Paperclip,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const API_BASE = "http://localhost:5000";

type Task = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string;
  assignees: { name: string; initials: string }[];
  comments: number;
  attachments: number;
  tags: string[];
};

type Column = {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
};

const columns: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "bg-muted-foreground",
    tasks: [
      {
        id: 1,
        title: "Research competitor analysis",
        description: "Analyze top 5 competitors for Q1 strategy",
        priority: "low",
        dueDate: "Dec 20",
        assignees: [{ name: "Sarah J", initials: "SJ" }],
        comments: 3,
        attachments: 1,
        tags: ["Research"],
      },
      {
        id: 2,
        title: "Update documentation",
        description: "Update API docs for v2.0 release",
        priority: "medium",
        dueDate: "Dec 18",
        assignees: [
          { name: "Michael C", initials: "MC" },
          { name: "Emily D", initials: "ED" },
        ],
        comments: 5,
        attachments: 2,
        tags: ["Docs", "API"],
      },
    ],
  },
  {
    id: "todo",
    title: "To Do",
    color: "bg-chart-1",
    tasks: [
      {
        id: 3,
        title: "Design new dashboard UI",
        description: "Create mockups for the analytics dashboard",
        priority: "high",
        dueDate: "Dec 12",
        assignees: [{ name: "Lisa A", initials: "LA" }],
        comments: 8,
        attachments: 4,
        tags: ["Design", "UI/UX"],
      },
      {
        id: 4,
        title: "Setup CI/CD pipeline",
        description: "Configure GitHub Actions for automated testing",
        priority: "medium",
        dueDate: "Dec 15",
        assignees: [{ name: "David M", initials: "DM" }],
        comments: 2,
        attachments: 0,
        tags: ["DevOps"],
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "bg-chart-4",
    tasks: [
      {
        id: 5,
        title: "Implement user authentication",
        description: "Add OAuth 2.0 support with Google and GitHub",
        priority: "urgent",
        dueDate: "Dec 10",
        assignees: [
          { name: "Michael C", initials: "MC" },
          { name: "Robert W", initials: "RW" },
        ],
        comments: 12,
        attachments: 3,
        tags: ["Backend", "Security"],
      },
      {
        id: 6,
        title: "Mobile responsive fixes",
        description: "Fix layout issues on tablet and mobile devices",
        priority: "high",
        dueDate: "Dec 11",
        assignees: [{ name: "Emily D", initials: "ED" }],
        comments: 6,
        attachments: 5,
        tags: ["Frontend", "Mobile"],
      },
    ],
  },
  {
    id: "review",
    title: "In Review",
    color: "bg-chart-2",
    tasks: [
      {
        id: 7,
        title: "Payment integration",
        description: "Integrate Stripe for subscription payments",
        priority: "high",
        dueDate: "Dec 8",
        assignees: [
          { name: "Sarah J", initials: "SJ" },
          { name: "David M", initials: "DM" },
        ],
        comments: 15,
        attachments: 2,
        tags: ["Backend", "Payments"],
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "bg-chart-3",
    tasks: [
      {
        id: 8,
        title: "Database optimization",
        description: "Optimize slow queries and add indexes",
        priority: "medium",
        dueDate: "Dec 5",
        assignees: [{ name: "Robert W", initials: "RW" }],
        comments: 4,
        attachments: 1,
        tags: ["Backend", "Performance"],
      },
    ],
  },
];

const priorityConfig = {
  low: { color: "bg-muted", textColor: "text-muted-foreground" },
  medium: { color: "bg-chart-4/20", textColor: "text-chart-4" },
  high: { color: "bg-chart-5/20", textColor: "text-chart-5" },
  urgent: { color: "bg-destructive/20", textColor: "text-destructive" },
};

function TaskCard({ task }: { task: Task }) {
  const priority = priorityConfig[task.priority];

  return (
    <div className="kanban-card group">
      {/* Priority & Menu */}
      <div className="flex items-center justify-between mb-2">
        <Badge className={cn(priority.color, priority.textColor, "text-[10px] uppercase font-semibold")}>
          {task.priority}
        </Badge>
        <Button
          variant="ghost"
          size="icon-sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Title & Description */}
      <h4 className="font-medium text-sm">{task.title}</h4>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
        {task.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {task.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        {/* Assignees */}
        <div className="flex -space-x-2">
          {task.assignees.slice(0, 3).map((assignee, i) => (
            <Avatar key={i} className="w-6 h-6 border-2 border-card">
              <AvatarFallback className="text-[10px] bg-muted">
                {assignee.initials}
              </AvatarFallback>
            </Avatar>
          ))}
          {task.assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-medium">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {task.dueDate}
          </span>
          {task.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {task.comments}
            </span>
          )}
          {task.attachments > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              {task.attachments}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Kanban() {
  const [board, setBoard] = useState<Column[]>([
    { id: "backlog", title: "Backlog", color: "bg-muted-foreground", tasks: [] },
    { id: "todo", title: "To Do", color: "bg-chart-1", tasks: [] },
    { id: "in-progress", title: "In Progress", color: "bg-chart-4", tasks: [] },
    { id: "review", title: "In Review", color: "bg-chart-2", tasks: [] },
    { id: "done", title: "Done", color: "bg-chart-3", tasks: [] },
  ]);
  const [openAdd, setOpenAdd] = useState(false);
  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [relatedTo, setRelatedTo] = useState("-");
  const [points, setPoints] = useState("1 Point");
  const [assignee, setAssignee] = useState("HealthSpire");
  const [collaborators, setCollaborators] = useState("");
  const [status, setStatus] = useState("To do");
  const [priority, setPriority] = useState("Priority");
  const [labels, setLabels] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);

  const statusToColumn = (s: string) => (s === "To do" ? "todo" : s === "In progress" ? "in-progress" : s === "In Review" ? "review" : s === "Backlog" ? "backlog" : "done");
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tasks`);
        if (!res.ok) return;
        const data = await res.json();
        const all: Task[] = (Array.isArray(data) ? data : []).map((d: any) => ({
          id: String(d._id || ""),
          title: d.title || "-",
          description: d.description || "",
          priority: (d.priority as any) || "medium",
          dueDate: d.deadline ? new Date(d.deadline).toISOString().slice(0,10) : "",
          assignees: Array.isArray(d.assignees) ? d.assignees : [],
          comments: Number(d.comments || 0),
          attachments: Number(d.attachments || 0),
          tags: Array.isArray(d.tags) ? d.tags : [],
        }));
        const byStatus: Record<string, Task[]> = { backlog: [], todo: [], "in-progress": [], review: [], done: [] };
        (Array.isArray(data) ? data : []).forEach((d: any) => {
          const s = d.status || "todo";
          const t = all.find(x => x.id === String(d._id || ""));
          if (!t) return;
          if (!byStatus[s]) byStatus[s] = [];
          byStatus[s].push(t);
        });
        setBoard([
          { id: "backlog", title: "Backlog", color: "bg-muted-foreground", tasks: byStatus["backlog"] || [] },
          { id: "todo", title: "To Do", color: "bg-chart-1", tasks: byStatus["todo"] || [] },
          { id: "in-progress", title: "In Progress", color: "bg-chart-4", tasks: byStatus["in-progress"] || [] },
          { id: "review", title: "In Review", color: "bg-chart-2", tasks: byStatus["review"] || [] },
          { id: "done", title: "Done", color: "bg-chart-3", tasks: byStatus["done"] || [] },
        ]);
      } catch {}
    })();
  }, []);

  const saveTask = async (keepOpen: boolean) => {
    if (!title.trim()) return;
    try {
      const apiStatus = statusToColumn(status);
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        status: apiStatus,
        priority: "medium",
        start: startDate ? new Date(startDate) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        assignees: assignee ? [{ name: assignee, initials: assignee.split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase() }] : [],
        tags: labels ? labels.split(",").map(s=>s.trim()).filter(Boolean) : [],
      };
      const res = await fetch(`${API_BASE}/api/tasks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { toast.error("Failed to add task"); return; }
      const d = await res.json();
      const newTask: Task = {
        id: String(d._id || ""),
        title: d.title || payload.title,
        description: d.description || payload.description,
        priority: (d.priority as any) || "medium",
        dueDate: d.deadline ? new Date(d.deadline).toISOString().slice(0,10) : (deadline || startDate || ""),
        assignees: Array.isArray(d.assignees) ? d.assignees : payload.assignees,
        comments: Number(d.comments || 0),
        attachments: Number(d.attachments || 0),
        tags: Array.isArray(d.tags) ? d.tags : payload.tags,
      };
      setBoard((prev) => prev.map(c => c.id === apiStatus ? { ...c, tasks: [newTask, ...c.tasks] } : c));
      if (!keepOpen) setOpenAdd(false);
      toast.success("Task added");
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with tabs and actions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display">Tasks</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">Add multiple tasks</Button>
            <Dialog open={openAdd} onOpenChange={setOpenAdd}>
              <DialogTrigger asChild>
                <Button variant="gradient"><Plus className="w-4 h-4 mr-2"/>Add task</Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Add task</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="space-y-1"><Label>Title</Label><Input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Description</Label><Textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} className="min-h-[120px]"/></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Related to</Label><Select value={relatedTo} onValueChange={setRelatedTo}><SelectTrigger><SelectValue placeholder="-"/></SelectTrigger><SelectContent><SelectItem value="-">-</SelectItem></SelectContent></Select></div>
                    <div className="space-y-1"><Label>Points</Label><Select value={points} onValueChange={setPoints}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,5,8].map(p=> <SelectItem key={p} value={`${p} Point`}>{p} Point</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Assign to</Label><Select value={assignee} onValueChange={setAssignee}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="HealthSpire">HealthSpire</SelectItem><SelectItem value="John Doe">John Doe</SelectItem></SelectContent></Select></div>
                    <div className="space-y-1"><Label>Collaborators</Label><Input placeholder="Collaborators" value={collaborators} onChange={(e)=>setCollaborators(e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="To do">To do</SelectItem><SelectItem value="In progress">In progress</SelectItem><SelectItem value="Done">Done</SelectItem></SelectContent></Select></div>
                    <div className="space-y-1"><Label>Priority</Label><Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Priority">Priority</SelectItem><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select></div>
                  </div>
                  <div className="space-y-1"><Label>Labels</Label><Input placeholder="Labels" value={labels} onChange={(e)=>setLabels(e.target.value)} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Start date</Label><Input type="date" placeholder="YYYY-MM-DD" value={startDate} onChange={(e)=>setStartDate(e.target.value)} /></div>
                    <div className="space-y-1"><Label>Deadline</Label><Input type="date" placeholder="YYYY-MM-DD" value={deadline} onChange={(e)=>setDeadline(e.target.value)} /></div>
                  </div>
                </div>
                <DialogFooter>
                  <div className="flex-1"><input ref={uploadRef} type="file" className="hidden" /><Button variant="outline" type="button" onClick={()=>uploadRef.current?.click()}><Paperclip className="w-4 h-4 mr-2"/>Upload File</Button></div>
                  <Button variant="outline" onClick={()=>setOpenAdd(false)}>Close</Button>
                  <Button variant="gradient" onClick={()=>saveTask(true)}>Save & show</Button>
                  <Button onClick={()=>saveTask(false)}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Tabs nav (List / Kanban / Gantt) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <NavLink to="/projects/tasks" className={({isActive})=>cn("pb-2", isActive?"border-b-2 border-primary font-medium":"text-muted-foreground hover:text-foreground")}>List</NavLink>
            <NavLink to="/projects/kanban" className={({isActive})=>cn("pb-2", isActive?"border-b-2 border-primary font-medium":"text-muted-foreground hover:text-foreground")}>Kanban</NavLink>
            <NavLink to="/projects/timeline" className={({isActive})=>cn("pb-2", isActive?"border-b-2 border-primary font-medium":"text-muted-foreground hover:text-foreground")}>Gantt</NavLink>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-10 w-64" />
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon"><RefreshCw className="w-4 h-4"/></Button>
          <Button variant="outline">- Quick filters -</Button>
          <Select>
            <SelectTrigger className="w-40"><SelectValue placeholder="- Related to -"/></SelectTrigger>
            <SelectContent><SelectItem value="-">-</SelectItem></SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40"><SelectValue placeholder="- Project -"/></SelectTrigger>
            <SelectContent><SelectItem value="-">-</SelectItem></SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40"><SelectValue placeholder="- Milestone -"/></SelectTrigger>
            <SelectContent><SelectItem value="-">-</SelectItem></SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40"><SelectValue placeholder="HealthSpire"/></SelectTrigger>
            <SelectContent><SelectItem value="healthspire">HealthSpire</SelectItem></SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40"><SelectValue placeholder="- Priority -"/></SelectTrigger>
            <SelectContent><SelectItem value="-">-</SelectItem></SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40"><SelectValue placeholder="- Label -"/></SelectTrigger>
            <SelectContent><SelectItem value="-">-</SelectItem></SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40"><SelectValue placeholder="- Deadline -"/></SelectTrigger>
            <SelectContent><SelectItem value="-">-</SelectItem></SelectContent>
          </Select>
          <Button variant="success" size="icon"><Check className="w-4 h-4"/></Button>
          <Button variant="outline" size="icon"><X className="w-4 h-4"/></Button>
        </div>
      </Card>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
        {board.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-[320px]">
            <Card className="h-full">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", column.color)} />
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        {column.title}
                      </CardTitle>
                      <div className={cn("h-0.5 mt-2 rounded", column.id==="todo"?"bg-amber-400": column.id==="in-progress"?"bg-blue-500":"bg-green-500")} />
                    </div>
                    <Badge variant="secondary" className="text-xs ml-1">
                      {column.tasks.length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon-sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-3 min-h-[400px]">
                {column.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
