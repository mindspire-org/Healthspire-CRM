import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthHeaders } from "@/lib/api/auth";
import { API_BASE } from "@/lib/api/base";
import { toast } from "@/components/ui/sonner";

export default function VendorLedger() {
  const [vendorId, setVendorId] = useState("");
  const [vendors, setVendors] = useState<any[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!vendorId) {
      toast.error("Vendor ID is required");
      return;
    }
    setBusy(true);
    try {
      const sp = new URLSearchParams();
      if (from) sp.set("from", from);
      if (to) sp.set("to", to);
      sp.set("entityType", "vendor");
      sp.set("entityId", vendorId);
      const res = await fetch(`${API_BASE}/api/ledgers/entity?${sp.toString()}`, { headers: { ...getAuthHeaders() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load ledger");
      setRows(Array.isArray(json?.rows) ? json.rows : []);
      toast.success("Vendor ledger loaded");
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/vendors`, { headers: { ...getAuthHeaders() } });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load vendors");
        setVendors(Array.isArray(json) ? json : []);
      } catch (e: any) {
        toast.error(e?.message || "Failed to load vendors");
      }
    })();
  }, []);

  const exportCsv = () => {
    const header = ["Date","Account","Memo","Debit","Credit","Balance"]; 
    const lines = rows.map((r:any)=> [
      String(r.date).slice(0,10),
      r.accountCode || "",
      (r.memo||"").replace(/\n|\r/g, " "),
      Number(r.debit||0).toFixed(2),
      Number(r.credit||0).toFixed(2),
      Number(r.balance||0).toFixed(2),
    ]);
    const csv = [header, ...lines].map((cols)=> cols.map((c)=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendor_ledger_${vendorId || "unknown"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPdf = () => {
    window.print();
  };

  const downloadStatementPdf = () => {
    if (!vendorId) {
      toast.error("Select a vendor first");
      return;
    }
    const sp = new URLSearchParams();
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    const url = `${API_BASE}/api/statements/vendor/${vendorId}?${sp.toString()}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Ledger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <Label>Vendor</Label>
              <select className="border rounded h-10 px-2 w-full bg-background" value={vendorId} onChange={(e)=>setVendorId(e.target.value)}>
                <option value="">Select vendor...</option>
                {vendors.map((v)=> (
                  <option key={v._id} value={v._id}>{v.name}{v.company?` - ${v.company}`:""}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={load} disabled={!vendorId || busy}>Load</Button>
              <Button variant="secondary" onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>
              <Button variant="secondary" onClick={downloadStatementPdf} disabled={!rows.length}>Statement PDF</Button>
              <Button variant="secondary" onClick={printPdf} disabled={!rows.length}>Print</Button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-[760px] w-full text-sm print:w-full print:min-w-0">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 pr-2">Account</th>
                  <th className="py-2 pr-2">Memo</th>
                  <th className="py-2 pr-2 text-right">Debit</th>
                  <th className="py-2 pr-2 text-right">Credit</th>
                  <th className="py-2 pr-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r:any, i:number)=> (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1 pr-2">{String(r.date).slice(0,10)}</td>
                    <td className="py-1 pr-2">{r.accountCode}</td>
                    <td className="py-1 pr-2">{r.memo || ""}</td>
                    <td className="py-1 pr-2 text-right">{Number(r.debit||0).toFixed(2)}</td>
                    <td className="py-1 pr-2 text-right">{Number(r.credit||0).toFixed(2)}</td>
                    <td className="py-1 pr-2 text-right">{Number(r.balance||0).toFixed(2)}</td>
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
