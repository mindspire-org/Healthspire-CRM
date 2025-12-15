import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ShoppingCart, LineChart, Clock, LayoutGrid, Layers, Ticket, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportsNav() {
  const { pathname } = useLocation();
  const pill = "rounded-full";
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn(pill, isActive("/reports/sales") && "bg-sidebar-accent text-sidebar-accent-foreground border-transparent")}>
            <ShoppingCart className="w-4 h-4 mr-2"/> Sales <ChevronDown className="w-4 h-4 ml-2"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild>
            <Link to="/reports/sales/invoices-summary">Invoices summary</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn(pill, isActive("/reports/finance") && "bg-sidebar-accent text-sidebar-accent-foreground border-transparent")}>
            <LineChart className="w-4 h-4 mr-2"/> Finance <ChevronDown className="w-4 h-4 ml-2"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild>
            <Link to="/reports/finance/income-vs-expenses">Income vs Expenses</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/reports/finance/expenses-summary">Expenses summary</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/reports/finance/payments-summary">Payments summary</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button asChild variant="outline" className={cn(pill, isActive("/reports/timesheets") && "bg-sidebar-accent text-sidebar-accent-foreground border-transparent")}> 
        <Link to="/reports/timesheets"><Clock className="w-4 h-4 mr-2"/> Timesheets</Link>
      </Button>

      <Button asChild variant="outline" className={cn(pill, isActive("/reports/projects") && "bg-sidebar-accent text-sidebar-accent-foreground border-transparent")}> 
        <Link to="/reports/projects/team-members"><LayoutGrid className="w-4 h-4 mr-2"/> Projects</Link>
      </Button>

      <Button asChild variant="outline" className={cn(pill, isActive("/reports/leads") && "bg-sidebar-accent text-sidebar-accent-foreground border-transparent")}> 
        <Link to="/reports/leads/conversions"><Layers className="w-4 h-4 mr-2"/> Leads</Link>
      </Button>

      <Button asChild variant="outline" className={cn(pill, isActive("/reports/tickets") && "bg-sidebar-accent text-sidebar-accent-foreground border-transparent")}> 
        <Link to="/reports/tickets/statistics"><Ticket className="w-4 h-4 mr-2"/> Tickets</Link>
      </Button>
    </div>
  );
}
