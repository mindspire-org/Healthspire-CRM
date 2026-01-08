import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  ShoppingCart,
  LineChart,
  Layers,
  LayoutGrid,
  Clock,
  Ticket,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import ReportsNav from "./ReportsNav";

type ReportLink = {
  title: string;
  description: string;
  href: string;
};

type ReportCategory = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  links: ReportLink[];
};

const categories: ReportCategory[] = [
  {
    title: "Sales",
    description: "Invoices, sales performance, and summaries",
    icon: ShoppingCart,
    accent: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    links: [
      {
        title: "Invoices Summary",
        description: "Overview of invoices, status, and totals",
        href: "/reports/sales/invoices-summary",
      },
    ],
  },
  {
    title: "Finance",
    description: "Income, expenses, and payment analytics",
    icon: LineChart,
    accent: "from-indigo-500/20 via-indigo-500/10 to-transparent",
    links: [
      {
        title: "Income vs Expenses",
        description: "Compare incoming and outgoing cashflow",
        href: "/reports/finance/income-vs-expenses",
      },
      {
        title: "Expenses Summary",
        description: "Track spending by category and period",
        href: "/reports/finance/expenses-summary",
      },
      {
        title: "Payments Summary",
        description: "Payment totals and trends",
        href: "/reports/finance/payments-summary",
      },
    ],
  },
  {
    title: "Leads",
    description: "Conversion insights and team performance",
    icon: Layers,
    accent: "from-fuchsia-500/20 via-fuchsia-500/10 to-transparent",
    links: [
      {
        title: "Conversions",
        description: "Lead conversions with filters and trends",
        href: "/reports/leads/conversions",
      },
      {
        title: "Team Members",
        description: "Leads by team member and activity",
        href: "/reports/leads/team-members",
      },
    ],
  },
  {
    title: "Projects",
    description: "Project team and client reporting",
    icon: LayoutGrid,
    accent: "from-sky-500/20 via-sky-500/10 to-transparent",
    links: [
      {
        title: "Team Members",
        description: "Project distribution across team",
        href: "/reports/projects/team-members",
      },
      {
        title: "Clients",
        description: "Client-wise project summary",
        href: "/reports/projects/clients",
      },
    ],
  },
  {
    title: "Timesheets",
    description: "Time tracking with filters and breakdowns",
    icon: Clock,
    accent: "from-amber-500/20 via-amber-500/10 to-transparent",
    links: [
      {
        title: "Timesheets",
        description: "Timesheet entries and summary view",
        href: "/reports/timesheets",
      },
    ],
  },
  {
    title: "Tickets",
    description: "Support stats and performance",
    icon: Ticket,
    accent: "from-rose-500/20 via-rose-500/10 to-transparent",
    links: [
      {
        title: "Statistics",
        description: "Ticket volume and status metrics",
        href: "/reports/tickets/statistics",
      },
    ],
  },
];

export default function ReportsDashboard() {
  return (
    <div className="relative animate-fade-in max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.10),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(34,197,94,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(2,6,23,0.02),transparent)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(2,6,23,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.18] dark:opacity-[0.12]" />
      </div>

      <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white shadow-[0_22px_70px_rgba(2,6,23,0.35)]">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 18%, rgba(99,102,241,0.55) 0, rgba(99,102,241,0) 40%), radial-gradient(circle at 85% 25%, rgba(168,85,247,0.45) 0, rgba(168,85,247,0) 40%), radial-gradient(circle at 45% 90%, rgba(34,197,94,0.25) 0, rgba(34,197,94,0) 45%)",
          }}
        />

        <div className="absolute inset-0 opacity-30 [mask-image:radial-gradient(circle_at_50%_30%,black,transparent_65%)]">
          <div className="absolute -top-28 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/20 to-emerald-500/25 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/70">Reports</div>
            <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold tracking-tight">
              Insights & Analytics
            </h1>
            <p className="mt-2 text-white/70 max-w-2xl">
              A single place to monitor sales, finance, leads, projects, timesheets and support.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-white/10 text-white hover:bg-white/20 border-white/15" variant="outline">
              <Link to="/reports/sales/invoices-summary">
                <BarChart3 className="w-4 h-4 mr-2" />
                Open Invoices Summary
              </Link>
            </Button>
            <Button asChild className="bg-indigo-500 text-white hover:bg-indigo-500/90 shadow-[0_10px_30px_rgba(99,102,241,0.35)]">
              <Link to="/reports/finance/income-vs-expenses">
                <Sparkles className="w-4 h-4 mr-2" />
                Quick Finance View
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-6">
          <ReportsNav />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card
              key={cat.title}
              className="group border-0 shadow-[0_14px_40px_rgba(15,23,42,0.10)] bg-white/85 backdrop-blur-sm dark:bg-slate-900/70 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
            >
              <div className={`h-24 bg-gradient-to-br ${cat.accent}`} />
              <CardContent className="p-5 -mt-12">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="relative rounded-2xl bg-white/85 dark:bg-white/10 p-2.5 border border-white/35 dark:border-white/10 shadow-sm">
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.accent} opacity-60`} />
                        <div className="relative grid place-items-center">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{cat.title}</div>
                        <div className="text-xs text-muted-foreground">{cat.description}</div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {cat.links.length} report{cat.links.length === 1 ? "" : "s"}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2">
                  {cat.links.map((l) => (
                    <Link
                      key={l.href}
                      to={l.href}
                      className="group flex items-start justify-between gap-3 rounded-2xl border border-white/40 bg-white/70 p-3.5 backdrop-blur transition-all duration-200 hover:bg-white/95 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{l.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{l.description}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:text-foreground group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>
    </div>
  );
}
