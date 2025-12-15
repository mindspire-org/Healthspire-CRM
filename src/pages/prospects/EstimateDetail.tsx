import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { ChevronDown } from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function EstimateDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState<string>("1");
  const [unitType, setUnitType] = useState("");
  const [rate, setRate] = useState<string>("0");
  // signature source with fallbacks
  const signatureCandidates = [
    "/signature.png",
    "/signature.jpg",
    "/signature.jpeg",
    "/signature.webp",
    "/signature.svg",
  ];
  const [sigSrc, setSigSrc] = useState(signatureCandidates[0]);
  const handleSigError = () => {
    const idx = signatureCandidates.indexOf(sigSrc);
    if (idx < signatureCandidates.length - 1) setSigSrc(signatureCandidates[idx + 1]);
  };
  // edit fields
  const [eClient, setEClient] = useState("");
  const [eEstimateDate, setEEstimateDate] = useState("");
  const [eValidUntil, setEValidUntil] = useState("");
  const [eTax, setETax] = useState("");
  const [eTax2, setETax2] = useState("");
  const [eNote, setENote] = useState("");
  const [eAdvancedAmount, setEAdvancedAmount] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/estimates/${id}`);
        if (!res.ok) return;
        const d = await res.json();
        setRow(d);
        setItems(Array.isArray(d.items) ? d.items : []);
      } catch {}
    })();
  }, [id]);

  // auto-print if ?print=1
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("print") === "1") {
      setTimeout(() => window.print(), 300);
    }
  }, []);

  const subTotal = useMemo(() => items.reduce((a, it) => a + Number(it.total || (Number(it.quantity||0) * Number(it.rate||0))), 0), [items]);
  const taxAmount = useMemo(() => Math.round((Number(row?.tax||0)/100) * subTotal), [subTotal, row]);
  const tax2Amount = useMemo(() => Math.round((Number(row?.tax2||0)/100) * subTotal), [subTotal, row]);
  const grandTotal = subTotal + taxAmount + tax2Amount;

  const addItem = async () => {
    const q = Number(quantity||0);
    const r = Number(rate||0);
    const newItem = { item: itemName || "Item", description: description || undefined, quantity: q, unit: unitType || undefined, rate: r, total: q*r } as any;
    try {
      const res = await fetch(`${API_BASE}/api/estimates/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ $push: { items: newItem } }) as any });
      // fallback update: fetch and merge
      setItems(prev => [newItem, ...prev]);
      setAddOpen(false); setItemName(""); setDescription(""); setQuantity("1"); setUnitType(""); setRate("0");
    } catch {}
  };

  const patchStatus = async (status: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/estimates/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) return toast.error("Failed to update status");
      const d = await res.json();
      setRow(d);
      toast.success(`Marked as ${status}`);
    } catch {}
  };

  const cloneEstimate = async () => {
    try {
      if (!row) return;
      const payload = { ...row };
      delete (payload as any)._id; delete (payload as any).id; delete (payload as any).number; delete (payload as any).createdAt; delete (payload as any).updatedAt; 
      const res = await fetch(`${API_BASE}/api/estimates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) return toast.error("Failed to clone estimate");
      const d = await res.json();
      toast.success("Estimate cloned");
      navigate(`/prospects/estimates/${d._id}`);
    } catch {}
  };

  // status ribbon style for document overlay
  const statusText = (row?.status && String(row.status)) || "Draft";
  const statusStyle = useMemo(() => {
    switch (statusText.toLowerCase()) {
      case "accepted":
        return "bg-purple-600 text-white";
      case "declined":
        return "bg-red-600 text-white";
      case "sent":
        return "bg-blue-600 text-white";
      case "draft":
      default:
        return "bg-gray-300 text-gray-700";
    }
  }, [statusText]);

  const openPreview = () => {
    window.open(`/prospects/estimates/${id}`, "_blank");
  };

  const viewPdf = () => {
    window.open(`/prospects/estimates/${id}?print=1`, "_blank");
  };

  const downloadPdf = () => {
    // Uses browser's print-to-PDF in a new tab. User can choose Save as PDF.
    window.open(`/prospects/estimates/${id}?print=1`, "_blank");
  };

  const editDialogOpen = () => {
    if (!row) return;
    setEClient(row.client || "");
    setEEstimateDate(row.estimateDate ? new Date(row.estimateDate).toISOString().slice(0,10) : "");
    setEValidUntil(row.validUntil ? new Date(row.validUntil).toISOString().slice(0,10) : "");
    setETax(String(row.tax ?? ""));
    setETax2(String(row.tax2 ?? ""));
    setENote(row.note || "");
    setEAdvancedAmount(String(row.advancedAmount ?? ""));
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      const update: any = {
        client: eClient || undefined,
        estimateDate: eEstimateDate ? new Date(eEstimateDate) : undefined,
        validUntil: eValidUntil ? new Date(eValidUntil) : undefined,
        tax: eTax ? Number(eTax) : 0,
        tax2: eTax2 ? Number(eTax2) : 0,
        note: eNote || undefined,
        advancedAmount: eAdvancedAmount ? Number(eAdvancedAmount) : 0,
      };
      const res = await fetch(`${API_BASE}/api/estimates/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(update) });
      if (!res.ok) return toast.error("Failed to save");
      const d = await res.json();
      setRow(d); setEditOpen(false); toast.success("Saved");
    } catch {}
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <style>{`
        @media print {
          @page { margin: 18mm; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body * { visibility: hidden !important; }
          #estimate-print, #estimate-print * { visibility: visible !important; }
          #estimate-print {
            position: absolute; left: 0; top: 0; width: 100%;
            transform: scale(0.85);
            transform-origin: top left;
            -webkit-transform: scale(0.85);
            -webkit-transform-origin: top left;
          }
          .print-hidden { display: none !important; }
          #estimate-print .status-ribbon {
            z-index: 10000 !important;
            left: -6px !important;
            top: -6px !important;
            padding: 4px 10px !important;
            font-size: 9px !important;
            border-radius: 2px !important;
            box-shadow: none !important;
            transform: rotate(-45deg) !important;
            -webkit-transform: rotate(-45deg) !important;
          }
          #estimate-print .status-ribbon .ribbon-notch { display: none !important; }
        }
      `}</style>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Estimate: {row?.number || "-"}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">Actions <ChevronDown className="w-4 h-4 ml-2"/></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={downloadPdf}>Download PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={viewPdf}>View PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={openPreview}>Estimate Preview</DropdownMenuItem>
            <DropdownMenuItem onClick={()=>navigator.clipboard?.writeText(window.location.href).then(()=>toast.success("URL copied"))}>Estimate URL</DropdownMenuItem>
            <DropdownMenuItem onClick={()=>window.print()}>Print estimate</DropdownMenuItem>
            <DropdownMenuItem onClick={editDialogOpen}>Edit estimate</DropdownMenuItem>
            <DropdownMenuItem onClick={cloneEstimate}>Clone Estimate</DropdownMenuItem>
            <DropdownMenuItem onClick={()=>patchStatus("Accepted")}>Mark as Accepted</DropdownMenuItem>
            <DropdownMenuItem onClick={()=>patchStatus("Declined")}>Mark as Declined</DropdownMenuItem>
            <DropdownMenuItem onClick={()=>patchStatus("Sent")}>Send to client</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-0" id="estimate-print">
            <Card className="p-6 relative shadow-none border-none rounded-none overflow-visible">
              {/* Diagonal status ribbon styled like sample */}
              <div className={`status-ribbon absolute -left-3 -top-3 rotate-[-45deg] uppercase tracking-wide font-semibold text-[10px] px-4 py-[3px] shadow z-50 whitespace-nowrap ${statusStyle}`} style={{ borderRadius: 3 }}>
                {statusText}
                {/* small white triangle notch */}
                <div className="ribbon-notch absolute -left-[3px] -top-[3px]" style={{ width: 0, height: 0, borderLeft: '3px solid transparent', borderTop: '3px solid white' }} />
              </div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img src="/HealthSpire%20logo%20image.png" alt="HealthSpire" style={{ height: 56 }} />
                  <div>
                    <div className="font-semibold">HealthSpire</div>
                    <div className="text-sm text-muted-foreground">Gujranwala, Pakistan</div>
                    <div className="text-sm text-muted-foreground">Email: info@healthspire.com</div>
                    <div className="text-sm text-muted-foreground">Website: www.healthspire.com</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-[#00BFA6] text-white px-4 py-2 rounded">Estimate: {row?.number || '-'}</div>
                  <div className="mt-2 text-sm text-muted-foreground">Advanced Amount: {row?.advancedAmount || 0}</div>
                  <div className="text-sm text-muted-foreground">Estimate date: {row?.estimateDate ? new Date(row.estimateDate).toISOString().slice(0,10) : '-'}</div>
                  <div className="text-sm text-muted-foreground">Valid until: {row?.validUntil ? new Date(row.validUntil).toISOString().slice(0,10) : '-'}</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <div className="font-medium">Estimate To</div>
                  <div className="text-muted-foreground">{row?.client || '-'}</div>
                </div>
                <div />
              </div>

              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#00BFA6]">
                      <TableHead className="text-white">Item</TableHead>
                      <TableHead className="text-white">Quantity</TableHead>
                      <TableHead className="text-white">Rate</TableHead>
                      <TableHead className="text-white">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">No record found.</TableCell>
                      </TableRow>
                    ) : (
                      items.map((it, idx) => (
                        <TableRow key={idx} className="border-b border-gray-200">
                          <TableCell>
                            <div className="font-medium">{it.item}</div>
                            {it.description ? (
                              <div className="text-xs text-muted-foreground">{it.description}</div>
                            ) : null}
                          </TableCell>
                          <TableCell>{it.quantity}</TableCell>
                          <TableCell>Rs.{Number(it.rate||0).toLocaleString()}</TableCell>
                          <TableCell>Rs.{Number(it.total||0).toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div className="mt-3 print-hidden">
                  <Button variant="outline" size="sm" onClick={()=>setAddOpen(true)}>+ Add item</Button>
                </div>
                <div className="mt-4">
                  <div className="ml-auto w-full sm:w-80">
                    <div className="flex items-center justify-between py-1">
                      <div className="text-muted-foreground">Sub Total</div>
                      <div>Rs.{subTotal.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div className="text-muted-foreground">Tax ({row?.tax||0}%)</div>
                      <div>Rs.{taxAmount.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div className="text-muted-foreground">Tax ({row?.tax2||0}%)</div>
                      <div>Rs.{tax2Amount.toLocaleString()}</div>
                    </div>
                    <div className="mt-1 border rounded overflow-hidden text-sm">
                      <div className="flex">
                        <div className="flex-1 px-3 py-2 font-medium">Total</div>
                        <div className="px-3 py-2 bg-[#00BFA6] text-white font-semibold">Rs.{grandTotal.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment section - matches provided footer */}
            <Card className="p-0 overflow-hidden shadow-none border-none rounded-none">
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="uppercase tracking-wide text-[11px] mb-2 inline-block text-gray-700 px-2 py-[2px] rounded" style={{ backgroundColor: '#E5E7EB' }}>Payment Method</div>
                  <div>Account No: 09040155845522</div>
                  <div>Account Name: Qutabiah Talat</div>
                  <div>Bank Name : Meezan Bank Pakistan</div>
                </div>
                <div>
                  <div className="uppercase tracking-wide text-[11px] mb-2 inline-block text-gray-700 px-2 py-[2px] rounded" style={{ backgroundColor: '#E5E7EB' }}>Payment Method</div>
                  <div>Paypal: ahmedmehmood554@gmail.com</div>
                  <div>Payoneer: qutabiahtalat313@gmail.com</div>
                </div>
                <div className="relative flex flex-col items-end justify-end min-h-[92px]">
                  <img src={sigSrc} onError={handleSigError} alt="Authorised Signature" className="h-10 object-contain absolute right-0 bottom-8" style={{ mixBlendMode: 'multiply' }} />
                  <div className="inline-block bg-purple-600 text-white text-[11px] px-3 py-1 rounded absolute right-0 bottom-0">Authorised Sign</div>
                </div>
              </div>
              <div className="relative h-4 w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-fuchsia-500" />
                <div className="absolute left-1/2 -translate-x-1/2 -top-[6px] w-12 h-4 bg-gradient-to-r from-purple-700 to-fuchsia-500 rotate-[-10deg]" />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Client:</div>
              <div className="font-medium">{row?.client || '-'}</div>
              <div className="mt-4 text-sm text-muted-foreground">Status:</div>
              <div><Badge variant={row?.status === 'Accepted' ? 'secondary' : 'outline'}>{row?.status || 'Draft'}</Badge></div>
              <div className="mt-4 text-sm text-muted-foreground">Last email sent:</div>
              <div className="text-sm">Never</div>
              <div className="mt-4 text-sm text-muted-foreground">Reminders (Private):</div>
              <Button variant="link" size="sm">+ Add reminder</Button>
              <div className="text-sm text-muted-foreground">No record found.</div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="p-6 text-sm text-muted-foreground">No tasks linked.</Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-card max-w-2xl">
          <DialogHeader><DialogTitle>Add item</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Item</div>
            <div className="sm:col-span-9"><Input placeholder="Select from list or create new item..." value={itemName} onChange={(e)=>setItemName(e.target.value)} /></div>

            <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Description</div>
            <div className="sm:col-span-9"><Textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} /></div>

            <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Quantity</div>
            <div className="sm:col-span-9"><Input placeholder="Quantity" value={quantity} onChange={(e)=>setQuantity(e.target.value)} /></div>

            <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Unit type</div>
            <div className="sm:col-span-9"><Input placeholder="Unit type (Ex: hours, pc, etc.)" value={unitType} onChange={(e)=>setUnitType(e.target.value)} /></div>

            <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Rate</div>
            <div className="sm:col-span-9"><Input placeholder="Rate" value={rate} onChange={(e)=>setRate(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setAddOpen(false)}>Close</Button>
            <Button onClick={addItem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit estimate dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card max-w-2xl">
          <DialogHeader><DialogTitle>Edit estimate</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Client</div>
            <div className="sm:col-span-9"><Input placeholder="Client" value={eClient} onChange={(e)=>setEClient(e.target.value)} /></div>

            <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Estimate date</div>
            <div className="sm:col-span-9"><Input type="date" value={eEstimateDate} onChange={(e)=>setEEstimateDate(e.target.value)} /></div>

            <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Valid until</div>
            <div className="sm:col-span-9"><Input type="date" value={eValidUntil} onChange={(e)=>setEValidUntil(e.target.value)} /></div>

            <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Tax</div>
            <div className="sm:col-span-9"><Input placeholder="Tax %" value={eTax} onChange={(e)=>setETax(e.target.value)} /></div>

            <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Second Tax</div>
            <div className="sm:col-span-9"><Input placeholder="Tax2 %" value={eTax2} onChange={(e)=>setETax2(e.target.value)} /></div>

            <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Advanced Amount</div>
            <div className="sm:col-span-9"><Input placeholder="Advanced Amount" value={eAdvancedAmount} onChange={(e)=>setEAdvancedAmount(e.target.value)} /></div>

            <div className="sm:col-span-3 sm:text-right sm:pt-2 text-sm text-muted-foreground">Note</div>
            <div className="sm:col-span-9"><Textarea placeholder="Note" value={eNote} onChange={(e)=>setENote(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setEditOpen(false)}>Close</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
