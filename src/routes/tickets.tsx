import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tickets as seed } from "@/lib/mock-data";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const tone: Record<string, string> = {
  Open: "bg-destructive/15 text-destructive",
  "In Progress": "bg-primary/10 text-primary",
  Resolved: "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)]",
};

export const Route = createFileRoute("/tickets")({ component: TicketsPage });

function TicketsPage() {
  const [rows, setRows] = useState(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", customer: "", assigned: "", priority: "Medium", status: "Open" });
  const create = () => {
    if (!form.subject || !form.customer) return toast.error("Subject and customer required");
    const id = `TK-${8100 + rows.length}`;
    setRows([{ id, ...form, created: new Date().toISOString().slice(0, 16).replace("T", " ") }, ...rows]);
    setForm({ subject: "", customer: "", assigned: "", priority: "Medium", status: "Open" });
    setOpen(false);
    toast.success("Ticket created");
  };
  return (
    <>
      <PageHeader title="Customer Service Tickets" description="Inbound requests from customers and field." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New Ticket</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New ticket</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="space-y-1.5"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Customer</Label><Input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Assigned to</Label><Input value={form.assigned} onChange={(e) => setForm({ ...form, assigned: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Low","Medium","High","Urgent"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Open","In Progress","Resolved"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                </div>
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
            { key: "id", header: "Ticket" },
            { key: "subject", header: "Subject", render: (r) => <span className="font-medium">{r.subject}</span> },
            { key: "customer", header: "Customer" },
            { key: "assigned", header: "Assigned" },
            { key: "priority", header: "Priority", render: (r) => <Badge variant="outline">{r.priority}</Badge> },
            { key: "status", header: "Status", render: (r) => <Badge className={`${tone[r.status]} border-transparent`}>{r.status}</Badge> },
            { key: "created", header: "Created" },
          ]}
        />
      </div>
    </>
  );
}