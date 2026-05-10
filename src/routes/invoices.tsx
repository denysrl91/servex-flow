import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Receipt, CircleDollarSign, AlertTriangle, CheckCircle2, DollarSign, Trash2 } from "lucide-react";
import { useTenantList, useTenantMutation, fmtMoney, fmtDate } from "@/lib/use-tenant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/invoices")({ component: InvoicesPage });

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type Customer = Pick<Database["public"]["Tables"]["customers"]["Row"], "id" | "name">;

const TONE: Record<string, string> = {
  paid: "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.65_0.20_145)] border-[oklch(0.65_0.20_145)/0.4]",
  sent: "bg-primary/10 text-primary border-primary/40",
  draft: "bg-muted text-muted-foreground border-border",
  overdue: "bg-destructive/15 text-destructive border-destructive/40",
  partial: "bg-[oklch(0.72_0.18_70)/0.15] text-[oklch(0.72_0.18_70)] border-[oklch(0.72_0.18_70)/0.4]",
};

function InvoicesPage() {
  const qc = useQueryClient();
  const invoicesQ = useTenantList<Invoice>("invoices", { orderBy: { column: "created_at", ascending: false }, limit: 200 });
  const customersQ = useTenantList<Customer>("customers", { select: "id,name", orderBy: { column: "name", ascending: true } });
  const customerMap = useMemo(
    () => Object.fromEntries((customersQ.data ?? []).map((c) => [c.id, c.name])),
    [customersQ.data],
  );

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer_id: "", subtotal: "", tax: "", due: "", status: "draft" });
  const [payOpen, setPayOpen] = useState<Invoice | null>(null);
  const [payForm, setPayForm] = useState({ amount: "", method: "card", reference: "" });

  const subtotal = Number(form.subtotal) || 0;
  const tax = Number(form.tax) || Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + tax;

  const create = useTenantMutation(
    "invoices",
    async (_, { companyId, userId, supabase }) => {
      if (!form.customer_id) throw new Error("Customer is required");
      if (!subtotal) throw new Error("Subtotal must be greater than zero");
      const invoice_number = `INV-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from("invoices").insert({
        company_id: companyId,
        invoice_number,
        customer_id: form.customer_id,
        subtotal,
        tax,
        total,
        balance_due: total,
        status: form.status as Invoice["status"],
        due_at: form.due || null,
        created_by: userId,
      });
      if (error) throw error;
    },
    { successMessage: "Invoice created" },
  );

  const recordPayment = useTenantMutation(
    "payments",
    async (_, { companyId, userId, supabase }) => {
      if (!payOpen) throw new Error("No invoice selected");
      const amt = Number(payForm.amount);
      if (!amt || amt <= 0) throw new Error("Amount must be greater than zero");
      const { error } = await supabase.from("payments").insert({
        company_id: companyId,
        invoice_id: payOpen.id,
        customer_id: payOpen.customer_id,
        amount: amt,
        method: payForm.method as Database["public"]["Tables"]["payments"]["Insert"]["method"],
        reference: payForm.reference || null,
        created_by: userId,
      });
      if (error) throw error;
      const newPaid = Number(payOpen.amount_paid) + amt;
      const newBalance = Math.max(0, Number(payOpen.total) - newPaid);
      const newStatus: Invoice["status"] = newBalance === 0 ? "paid" : "partial";
      await supabase.from("invoices").update({
        amount_paid: newPaid, balance_due: newBalance, status: newStatus,
      }).eq("id", payOpen.id);
    },
    { successMessage: "Payment recorded", invalidate: ["invoices", "payments"] },
  );

  const submit = () =>
    create.mutate(undefined, {
      onSuccess: () => {
        setOpen(false);
        setForm({ customer_id: "", subtotal: "", tax: "", due: "", status: "draft" });
      },
    });

  const submitPayment = () =>
    recordPayment.mutate(undefined, {
      onSuccess: () => {
        setPayOpen(null);
        setPayForm({ amount: "", method: "card", reference: "" });
      },
    });

  const removeInvoice = async (id: string) => {
    if (!confirm("Delete this invoice? Linked payments will remain.")) return;
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Invoice deleted");
    qc.invalidateQueries({ queryKey: ["invoices"] });
  };

  const rows = invoicesQ.data ?? [];
  const totalOutstanding = rows.reduce((s, r) => s + Number(r.balance_due), 0);
  const totalCollected = rows.reduce((s, r) => s + Number(r.amount_paid), 0);
  const overdueCount = rows.filter((r) => r.status === "overdue").length;
  const draftCount = rows.filter((r) => r.status === "draft").length;

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Send, track payments, and chase overdue balances."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
                <Plus className="mr-2 h-4 w-4" /> New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label>Customer</Label>
                  <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>
                      {(customersQ.data ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Subtotal</Label>
                    <Input type="number" step="0.01" min="0" value={form.subtotal} onChange={(e) => setForm({ ...form, subtotal: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tax (auto 8%)</Label>
                    <Input type="number" step="0.01" min="0" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} placeholder={String(Math.round(subtotal * 0.08 * 100) / 100)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Due date</Label>
                    <Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["draft", "sent", "paid", "overdue", "partial"].map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmtMoney(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{fmtMoney(tax)}</span></div>
                  <div className="mt-1 flex justify-between font-semibold"><span>Total</span><span>{fmtMoney(total)}</span></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} disabled={create.isPending} style={{ backgroundImage: "var(--gradient-primary)" }}>
                  {create.isPending ? "Creating…" : "Create invoice"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Kpi icon={CircleDollarSign} label="Outstanding" value={fmtMoney(totalOutstanding)} />
          <Kpi icon={CheckCircle2} label="Collected" value={fmtMoney(totalCollected)} />
          <Kpi icon={AlertTriangle} label="Overdue" value={String(overdueCount)} />
          <Kpi icon={Receipt} label="Drafts" value={String(draftCount)} />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesQ.isLoading && (
                  <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
                )}
                {!invoicesQ.isLoading && rows.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    No invoices yet. Create one above or convert an estimate.{" "}
                    <Link to="/estimates" className="text-primary hover:underline">View estimates →</Link>
                  </TableCell></TableRow>
                )}
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.invoice_number}</TableCell>
                    <TableCell className="font-medium">{customerMap[r.customer_id] ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{fmtDate(r.issued_at)}</TableCell>
                    <TableCell className="text-muted-foreground">{fmtDate(r.due_at)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtMoney(r.total)}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">{fmtMoney(r.balance_due)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${TONE[r.status] ?? ""}`}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(r.balance_due) > 0 ? (
                        <Button size="sm" variant="outline" onClick={() => { setPayOpen(r); setPayForm({ amount: String(r.balance_due), method: "card", reference: "" }); }}>
                          <DollarSign className="mr-1 h-3.5 w-3.5" /> Record
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Paid</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => removeInvoice(r.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!payOpen} onOpenChange={(v) => { if (!v) setPayOpen(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
          </DialogHeader>
          {payOpen && (
            <div className="space-y-3">
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Invoice</span><span className="font-mono">{payOpen.invoice_number}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span>{fmtMoney(payOpen.total)}</span></div>
                <div className="flex justify-between font-semibold"><span>Balance due</span><span>{fmtMoney(payOpen.balance_due)}</span></div>
              </div>
              <div className="space-y-1.5">
                <Label>Amount</Label>
                <Input type="number" step="0.01" min="0" max={Number(payOpen.balance_due)} value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Method</Label>
                <Select value={payForm.method} onValueChange={(v) => setPayForm({ ...payForm, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["card", "ach", "cash", "check", "other"].map((m) => (
                      <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Reference (optional)</Label>
                <Input value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} placeholder="Check #, txn ID…" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(null)}>Cancel</Button>
            <Button onClick={submitPayment} disabled={recordPayment.isPending} style={{ backgroundImage: "var(--gradient-primary)" }}>
              {recordPayment.isPending ? "Recording…" : "Record payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Receipt; label: string; value: string }) {
  return (
    <Card className="lift">
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-xs">{label}</span>
        </div>
        <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

