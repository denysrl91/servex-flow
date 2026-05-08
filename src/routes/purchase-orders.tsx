import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { purchaseOrders as seed } from "@/lib/mock-data";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/purchase-orders")({ component: POPage });

function POPage() {
  const [rows, setRows] = useState(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vendor: "", items: "", total: "", status: "Pending Approval" });
  const create = () => {
    if (!form.vendor || !form.total) return toast.error("Vendor and total required");
    const id = `PO-${4100 + rows.length}`;
    setRows([{ id, vendor: form.vendor, items: Number(form.items) || 1, total: Number(form.total), status: form.status, created: new Date().toISOString().slice(0, 10) }, ...rows]);
    setForm({ vendor: "", items: "", total: "", status: "Pending Approval" });
    setOpen(false);
    toast.success("Purchase order created");
  };
  return (
    <>
      <PageHeader title="Purchase Orders" description="Vendor orders and receiving." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New PO</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New purchase order</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="space-y-1.5"><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Items</Label><Input type="number" value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Total ($)</Label><Input type="number" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Pending Approval","Sent","Received","Cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create} style={{ backgroundImage: "var(--gradient-primary)" }}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="p-6">
        <DataTable
          rows={rows}
          columns={[
            { key: "id", header: "PO #" },
            { key: "vendor", header: "Vendor", render: (r) => <span className="font-medium">{r.vendor}</span> },
            { key: "items", header: "Items", className: "text-right" },
            { key: "total", header: "Total", render: (r) => <span className="font-medium">${r.total.toLocaleString()}</span>, className: "text-right" },
            { key: "created", header: "Created" },
            { key: "status", header: "Status", render: (r) => <Badge variant="outline">{r.status}</Badge> },
          ]}
        />
      </div>
    </>
  );
}