import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface Member {
  id: string; // employee ObjectId
  name: string;
  initials: string;
  clockedIn: boolean;
  startTime?: string; // HH:MM:SS
}

const initialMembers: Member[] = [];

export default function Attendance() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualIn, setManualIn] = useState("");
  const [manualOut, setManualOut] = useState("");

  const API_BASE = "http://localhost:5000";

  const refresh = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/attendance/members`);
      if (!res.ok) return;
      const data = await res.json();
      const mapped: Member[] = (Array.isArray(data) ? data : []).map((d: any) => ({
        id: d.employeeId,
        name: d.name,
        initials: d.initials,
        clockedIn: !!d.clockedIn,
        startTime: d.startTime,
      }));
      setMembers(mapped);
    } catch {}
  };

  useEffect(() => {
    refresh();
  }, []);

  const list = useMemo(() => {
    const s = query.toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(s));
  }, [members, query]);

  const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const toggleClock = async (id: string, clockedIn: boolean, name: string) => {
    try {
      if (clockedIn) {
        await fetch(`${API_BASE}/api/attendance/clock-out`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId: id, name }),
        });
      } else {
        await fetch(`${API_BASE}/api/attendance/clock-in`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId: id, name }),
        });
      }
    } catch {}
    await refresh();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Time cards</h1>
        <div className="flex items-center gap-2">
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Add time manually</Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Add time manually</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label>Member</Label>
                  <Input placeholder="Name" value={manualName} onChange={(e)=>setManualName(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Date</Label>
                    <Input type="date" value={manualDate} onChange={(e)=>setManualDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Clock in</Label>
                    <Input type="time" value={manualIn} onChange={(e)=>setManualIn(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Clock out</Label>
                    <Input type="time" value={manualOut} onChange={(e)=>setManualOut(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAdd(false)}>Close</Button>
                <Button onClick={async () => {
                  try {
                    await fetch(`${API_BASE}/api/attendance/manual`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: manualName,
                        date: manualDate,
                        clockIn: manualIn ? `${manualDate}T${manualIn}:00` : undefined,
                        clockOut: manualOut ? `${manualDate}T${manualOut}:00` : undefined,
                      })
                    });
                  } catch {}
                  setOpenAdd(false);
                  setManualName(""); setManualDate(""); setManualIn(""); setManualOut("");
                  await refresh();
                }}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 w-56" />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4">
            <Tabs defaultValue="clock">
              <TabsList className="bg-muted/40 flex flex-wrap gap-1">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="summary-details">Summary details</TabsTrigger>
                <TabsTrigger value="members">Members Clocked In</TabsTrigger>
                <TabsTrigger value="clock">Clock in-out</TabsTrigger>
              </TabsList>

              <TabsContent value="clock" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-[50%]">Team members</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Clock in-out</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {list.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-muted text-foreground/70 text-xs font-semibold">{m.initials}</AvatarFallback>
                                </Avatar>
                                <span className="capitalize">{m.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {m.clockedIn ? (
                                <span className="text-sm text-muted-foreground">Clock started at : {m.startTime}</span>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not clocked in yet</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {m.clockedIn ? (
                                <Button variant="outline" size="sm" onClick={() => toggleClock(m.id, true, m.name)}>Clock Out</Button>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => toggleClock(m.id, false, m.name)}>Clock In</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* The other tabs can be filled later as needed */}
              {(["daily","custom","summary","summary-details","members"] as const).map((t) => (
                <TabsContent key={t} value={t} className="mt-4">
                  <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">{t} view coming soon.</CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
