import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { invoices as seed } from "@/lib/mock-data";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const tone: Record<string, string> = {
  Paid: "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)]",
  Sent: "bg-primary/10 text-primary",
  Draft: "bg-muted text-muted-foreground",
  Overdue: "bg-destructive/15 text-destructive",
};

export const Route = createFileRoute("/invoices")({ component: InvoicesPage });

function InvoicesPage() {
  const [rows, setRows] = useState(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer: "", amount: "", due: "", status: "Draft" });
  const create = () => {
    const amt = Number(form.amount);
    if (!form.customer || !amt) return toast.error("Customer and amount required");
    const id = `INV-${9100 + rows.length}`;
    setRows([{ id, customer: form.customer, amount: amt, due: form.due || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), status: form.status, issued: new Date().toISOString().slice(0, 10) }, ...rows]);
    setForm({ customer: "", amount: "", due: "", status: "Draft" });
    setOpen(false);
    toast.success("Invoice created");
  };
  return (
    <>
      <PageHeader title="Invoices" description="Send, track payments, and chase overdue balances." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New Invoice</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="space-y-1.5"><Label>Customer</Label><Input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Due date</Label><Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Draft","Sent","Paid","Overdue"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
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
            { key: "id", header: "Invoice" },
            { key: "customer", header: "Customer", render: (r) => <span className="font-medium">{r.customer}</span> },
            { key: "issued", header: "Issued" },
            { key: "due", header: "Due" },
            { key: "amount", header: "Amount", render: (r) => <span className="font-medium">${r.amount.toLocaleString()}</span>, className: "text-right" },
            { key: "status", header: "Status", render: (r) => <Badge className={`${tone[r.status]} border-transparent`}>{r.status}</Badge> },
          ]}
        />
      </div>
    </>
  );
}