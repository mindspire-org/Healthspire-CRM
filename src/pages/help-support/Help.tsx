import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle } from "lucide-react";

export default function HelpSupportHelp() {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold flex items-center gap-2"><HelpCircle className="w-5 h-5"/> Help</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search help" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9 w-72" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-1">Getting started</h3>
              <p className="text-sm text-muted-foreground">Learn the basics of using HealthSpire Enterprise Suite.</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-1">Account & billing</h3>
              <p className="text-sm text-muted-foreground">Manage your account, billing and subscriptions.</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-1">Troubleshooting</h3>
              <p className="text-sm text-muted-foreground">Fix common issues and get support.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
