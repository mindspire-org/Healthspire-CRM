import { Bell, Search, Menu, Plus, LayoutGrid, Briefcase, Monitor, Globe, Mail, Settings, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopNavProps {
  onMenuClick: () => void;
}

const notifications = [
  { id: 1, title: "New lead assigned", message: "Sarah from Tech Corp", time: "2 min ago", unread: true },
  { id: 2, title: "Meeting reminder", message: "Client call in 30 minutes", time: "25 min ago", unread: true },
  { id: 3, title: "Task completed", message: "Project Alpha milestone", time: "1 hour ago", unread: false },
];

export function TopNav({ onMenuClick }: TopNavProps) {
  const logoCandidates = [
    "/HealthSpire logo image.png",
    "/HealthSpire logo.png",
    "/healthspire-logo.png",
    "/healthspire-logo.svg",
    "/healthspire.png",
    "/logo.png",
    "/logo.svg",
  ];
  const [logoSrc, setLogoSrc] = useState<string>(logoCandidates[0]);
  const onLogoError = () => {
    const i = logoCandidates.indexOf(logoSrc);
    if (i < logoCandidates.length - 1) setLogoSrc(logoCandidates[i + 1]);
  };
  const navigate = useNavigate();
  const handleSignOut = () => {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_user");
    } catch {}
    navigate("/auth", { replace: true });
  };
  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Left Section: menu + icon row */}
      <div className="flex items-center gap-4 text-muted-foreground">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="hidden lg:flex items-center gap-5">
          <CheckCircle className="w-5 h-5" />
          <LayoutGrid className="w-5 h-5" />
          <Briefcase className="w-5 h-5" />
          <Monitor className="w-5 h-5" />
        </div>
      </div>

      {/* Right Section: icons + avatar + brand */}
      <div className="flex items-center gap-3 text-muted-foreground">
        <Button variant="ghost" size="icon" className="hidden sm:flex"><Search className="w-5 h-5" /></Button>
        <Button variant="ghost" size="icon" className="hidden sm:flex"><Plus className="w-5 h-5" /></Button>
        <Button variant="ghost" size="icon" className="hidden md:flex"><Globe className="w-5 h-5" /></Button>
        <Button variant="ghost" size="icon" className="hidden md:flex"><Settings className="w-5 h-5" /></Button>
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-card">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="secondary" className="text-xs">2 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              >
                <div className="flex items-start gap-2 w-full">
                  {notification.unread && (
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-primary cursor-pointer justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" className="hidden sm:flex"><Mail className="w-5 h-5" /></Button>

        {/* User Menu + Brand */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
              <Avatar className="w-8 h-8">
                <AvatarImage src={logoSrc} onError={onLogoError} alt="HealthSpire" className="object-contain bg-white p-0.5" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-indigo text-primary-foreground text-xs font-semibold">HS</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">John Doe</span>
                <span className="text-xs text-muted-foreground">info@healthspire.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e)=>{e.preventDefault(); handleSignOut();}} className="text-destructive">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="hidden sm:inline text-sm text-muted-foreground">HealthSpire</span>
      </div>
    </header>
  );
}
