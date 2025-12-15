import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Briefcase,
  TrendingUp,
  Search,
  MoreHorizontal,
} from "lucide-react";

import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

const revenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 2000 },
  { month: "Apr", revenue: 2780 },
  { month: "May", revenue: 1890 },
  { month: "Jun", revenue: 2390 },
];

const invoiceData = [
  { name: "Paid", value: 8, color: "#10b981" },
  { name: "Not paid", value: 2, color: "#f59e0b" },
  { name: "Draft", value: 11, color: "#6366f1" },
];

const incomeData = [
  { month: "Jan", income: 4000, expense: 2400 },
  { month: "Feb", income: 3000, expense: 1398 },
  { month: "Mar", income: 2000, expense: 9800 },
  { month: "Apr", income: 2780, expense: 3908 },
  { month: "May", income: 1890, expense: 4800 },
  { month: "Jun", income: 2390, expense: 3800 },
];

type ProjectRow = { id: string; name: string; estimate: string };
type TaskRow = { id: string; title: string; startDate: string; deadline: string; status: string };

const announcements = [
  "polyfloor & doors door",
  "2 Medel MS Launch",
  "3 Marketing plan 10 pages",
  "4 Tender Websites",
];

export default function Dashboard() {
  const [openTasksCount, setOpenTasksCount] = useState(0);
  const [eventsToday, setEventsToday] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [projectCounts, setProjectCounts] = useState({ open: 0, completed: 0, hold: 0 });
  const [tasksPie, setTasksPie] = useState({ todo: 0, inProgress: 0, completed: 0, expired: 0 });
  const [teamMembers, setTeamMembers] = useState(0);
  const [onLeaveToday, setOnLeaveToday] = useState(0);
  const [projectsList, setProjectsList] = useState<ProjectRow[]>([]);
  const [tasksTable, setTasksTable] = useState<TaskRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Projects
        const pr = await fetch(`${API_BASE}/api/projects`);
        if (pr.ok) {
          const data = await pr.json();
          const list = (Array.isArray(data) ? data : []);
          const open = list.filter((p:any)=> (p.status||"Open")==="Open").length;
          const completed = list.filter((p:any)=> (p.status||"")==="Completed").length;
          const hold = list.filter((p:any)=> (p.status||"")==="Hold").length;
          setProjectCounts({ open, completed, hold });
          const sum = list.reduce((acc:number,p:any)=> acc + (Number(p.price||0)||0), 0);
          setTotalRevenue(sum);
          const right = list
            .slice(0,5)
            .map((p:any)=> ({ id: String(p._id||""), name: p.title || "-", estimate: p.deadline ? new Date(p.deadline).toISOString().slice(0,10).replaceAll('-','/') : "-" }));
          setProjectsList(right);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Tasks
        const tr = await fetch(`${API_BASE}/api/tasks`);
        if (tr.ok) {
          const data = await tr.json();
          const list = (Array.isArray(data) ? data : []);
          const todo = list.filter((t:any)=> t.status==="todo").length;
          const inProgress = list.filter((t:any)=> t.status==="in-progress").length;
          const completed = list.filter((t:any)=> t.status==="done").length;
          const todayIso = new Date().toISOString().slice(0,10);
          const events = list.filter((t:any)=> t.deadline && new Date(t.deadline).toISOString().slice(0,10)===todayIso).length;
          const expired = list.filter((t:any)=> t.deadline && new Date(t.deadline) < new Date() && t.status!=="done").length;
          setOpenTasksCount(list.filter((t:any)=> t.status!=="done").length);
          setEventsToday(events);
          setTasksPie({ todo, inProgress, completed, expired });
          const tbl: TaskRow[] = list.slice(0,8).map((t:any)=> ({ id: String(t._id||""), title: t.title||"-", startDate: t.start? new Date(t.start).toISOString().slice(0,10):"", deadline: t.deadline? new Date(t.deadline).toISOString().slice(0,10):"", status: t.status||"todo" }));
          setTasksTable(tbl);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Leaves
        const lr = await fetch(`${API_BASE}/api/leaves`);
        if (lr.ok) {
          const data = await lr.json();
          const list = (Array.isArray(data) ? data : []);
          setPendingLeaves(list.filter((l:any)=> (l.status||"pending")==="pending").length);
          const today = new Date();
          setOnLeaveToday(list.filter((l:any)=> l.from && l.to && new Date(l.from) <= today && today <= new Date(l.to)).length);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Employees count
        const er = await fetch(`${API_BASE}/api/employees`);
        if (er.ok) {
          const data = await er.json();
          setTeamMembers(Array.isArray(data)? data.length : 0);
        }
      } catch {}
    })();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Click started at</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">My open tasks</p>
                <p className="text-2xl font-bold mt-1">{openTasksCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Events today</p>
                <p className="text-2xl font-bold mt-1">{eventsToday}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1">{pendingLeaves}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-2 border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1 text-primary">Rs.{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Projects Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Open</span>
                  <span className="text-primary font-bold">{projectCounts.open}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Completed</span>
                  <span className="text-primary font-bold">{projectCounts.completed}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Hold</span>
                  <span className="text-primary font-bold">{projectCounts.hold}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(() => {
                        const total = projectCounts.open + projectCounts.completed + projectCounts.hold;
                        return total ? Math.round((projectCounts.completed / total) * 100) : 0;
                      })()}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Invoice Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={invoiceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                    {invoiceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                {invoiceData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Income vs Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="income" stroke="#10b981" />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* All Tasks Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">All Tasks Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "To do", value: tasksPie.todo, color: "#f59e0b" },
                      { name: "In progress", value: tasksPie.inProgress, color: "#3b82f6" },
                      { name: "Completed", value: tasksPie.completed, color: "#10b981" },
                      { name: "Expired", value: tasksPie.expired, color: "#ef4444" },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {[
                      { color: "#f59e0b" },
                      { color: "#3b82f6" },
                      { color: "#10b981" },
                      { color: "#ef4444" },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Team Members Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Team Members Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Team members</p>
                  <p className="text-3xl font-bold text-primary">{teamMembers}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">On leave today</p>
                  <p className="text-3xl font-bold text-primary">{onLeaveToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "HealthSpire", task: "Task #12: Advance account setup", date: "2025-01-15" },
                  { name: "HealthSpire", task: "Project: Commerce Digitizing system", date: "2025-01-15" },
                  { name: "HealthSpire", task: "Project: News & Notification Template", date: "2025-01-15" },
                  { name: "HealthSpire", task: "Task #31: Lender Website", date: "2025-01-15" },
                  { name: "HealthSpire", task: "Task #30: Qorinte purchase", date: "2025-01-15" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 pb-2 border-b last:border-b-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-primary">{item.name}</p>
                      <p className="text-xs text-foreground">{item.task}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Ticket Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ticket Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "Open", count: 0 },
                  { label: "Closed", count: 0 },
                  { label: "Closed", count: 0 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-primary font-bold">{item.count}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-3">New tickets in last 30 days</p>
              </div>
            </CardContent>
          </Card>

          {/* Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No events found!</p>
                <a href="#" className="text-xs text-primary mt-2">View on calendar</a>
              </div>
            </CardContent>
          </Card>

          {/* Open Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Open Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {projectsList.map((project) => (
                  <div key={project.id} className="text-xs">
                    <a href="#" className="text-primary font-medium hover:underline">{project.name}</a>
                    <p className="text-muted-foreground">Estimate: {project.estimate}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* To Do (Private) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">To Do (Private)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input type="text" placeholder="Add to do..." className="text-xs h-8" />
                  <Button size="sm" className="h-8">Save</Button>
                </div>
                <div className="space-y-1 mt-3">
                  {["To do", "Done", "Doing", "Search"].map((tab, i) => (
                    <div key={i} className="text-xs text-muted-foreground">{tab}</div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-3">No record found.</div>
              </div>
            </CardContent>
          </Card>

          {/* Sticky Note (Private) */}
          <Card className="bg-yellow-100">
            <CardContent className="p-4">
              <div className="space-y-1 text-xs">
                {announcements.map((item, i) => (
                  <div key={i}>{item}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">ID</th>
                  <th className="text-left py-2 px-2">Title</th>
                  <th className="text-left py-2 px-2">Start date</th>
                  <th className="text-left py-2 px-2">Deadline</th>
                  <th className="text-left py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {tasksTable.map((task) => (
                  <tr key={task.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">{task.id}</td>
                    <td className="py-2 px-2 text-primary">{task.title}</td>
                    <td className="py-2 px-2">{task.startDate}</td>
                    <td className="py-2 px-2">{task.deadline}</td>
                    <td className="py-2 px-2">{task.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
