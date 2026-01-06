import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, RefreshCw, Settings, MoreHorizontal } from "lucide-react";

import { toast } from "@/components/ui/sonner";
import { API_BASE } from "@/lib/api/base";
import { getAuthHeaders } from "@/lib/api/auth";

type DeleteAccountRequestStatus = "pending" | "approved" | "rejected";
type DeleteAccountRequestDoc = {
  _id: string;
  userId?: { _id: string; name?: string; email?: string; role?: string } | string;
  reason?: string;
  status: DeleteAccountRequestStatus;
  createdAt?: string;
  updatedAt?: string;
  processedAt?: string;
};

export default function DeleteRequest() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | DeleteAccountRequestStatus>("all");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<DeleteAccountRequestDoc[]>([]);

  const loadRows = async () => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      if (query.trim()) qp.set("q", query.trim());
      if (status !== "all") qp.set("status", status);

      const res = await fetch(`${API_BASE}/api/delete-account-requests?${qp.toString()}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load delete requests");
      setRows(Array.isArray(json) ? json : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load delete requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const formatDateTime = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  };

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const u = typeof r.userId === "string" ? null : r.userId;
      const hay = `${String(u?.name || "")} ${String(u?.email || "")} ${String(u?.role || "")} ${String(r.reason || "")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  const updateStatus = async (id: string, next: DeleteAccountRequestStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/delete-account-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to update request");
      toast.success("Updated");
      await loadRows();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update request");
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/delete-account-requests/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to delete request");
      toast.success("Deleted");
      await loadRows();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete request");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Delete Account Request</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Export <ChevronDown className="w-4 h-4 ml-2"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>CSV</DropdownMenuItem>
              <DropdownMenuItem>Excel</DropdownMenuItem>
              <DropdownMenuItem>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={loadRows} disabled={loading}>
            <RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
          </Button>
          <Button variant="outline" size="icon"><Settings className="w-4 h-4"/></Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-9" />
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button variant="outline">Filter</Button>
              <Button variant="outline">11 Nov 25 - 10 Dec 25</Button>
            </div>
            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Manage Columns</Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-8"><Checkbox /></TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Requisition Date</TableHead>
                <TableHead>Delete Request Date</TableHead>
                <TableHead>Reason for Deletion</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((r)=> {
                const u = typeof r.userId === "string" ? null : r.userId;
                const name = String(u?.name || u?.email || "User").trim() || "User";
                const role = String(u?.role || "").trim() || "-";
                const statusLabel = r.status === "pending" ? "Pending" : r.status === "approved" ? "Approved" : "Rejected";
                const badgeVariant = r.status === "pending" ? "secondary" : r.status === "approved" ? "success" : "destructive";

                return (
                <TableRow key={r._id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback>{name.split(' ').map(n=>n[0]).join('').slice(0,2)}</AvatarFallback></Avatar>
                      <div>
                        <div className="font-medium">{name}</div>
                        <div className="text-xs text-muted-foreground">{role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDateTime(r.createdAt)}</TableCell>
                  <TableCell>{formatDateTime(r.processedAt || r.updatedAt)}</TableCell>
                  <TableCell className="text-muted-foreground">{r.reason || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant as any}>{statusLabel}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm"><MoreHorizontal className="w-4 h-4"/></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateStatus(r._id, "approved")}>
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(r._id, "rejected")}>
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteRequest(r._id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
