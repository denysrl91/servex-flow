import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type PO = { id: string; po_number: string; vendor_name: string; status: string; subtotal: number; tax: number; total: number; expected_at: string | null; created_at: string };

export const Route = createFileRoute("/purchase-orders")({ component: POPage });

function POPage() {
  const qc = useQueryClient();
  const { companyId, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vendor_name: "", vendor_email: "", subtotal: "", tax: "", expected_at: "", status: "draft", notes: "" });

  const q = useQuery({
    queryKey: ["purchase_orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("purchase_orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PO[];
    },
  });

  const create = async () => {
    if (!companyId) return toast.error("Workspace loading");
    if (!form.vendor_name.trim()) return toast.error("Vendor required");
    const sub = Number(form.subtotal) || 0;
    const tax = Number(form.tax) || 0;
    const { error } = await supabase.from("purchase_orders").insert({
      company_id: companyId,
      po_number: `PO-${Date.now().toString().slice(-6)}`,
      vendor_name: form.vendor_name.trim(),
      vendor_email: form.vendor_email || null,
      subtotal: sub, tax, total: sub + tax,
      expected_at: form.expected_at || null,
      status: form.status as any,
      notes: form.notes || null,
      created_by: user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    setOpen(false);
    setForm({ vendor_name: "", vendor_email: "", subtotal: "", tax: "", expected_at: "", status: "draft", notes: "" });
    toast.success("Purchase order created");
    qc.invalidateQueries({ queryKey: ["purchase_orders"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this PO?")) return;
    const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["purchase_orders"] });
  };

  const rows = q.data ?? [];

  return (
    <>
      <PageHeader title="Purchase Orders" description="Vendor orders and receiving." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New PO</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New purchase order</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <Field label="Vendor name"><Input value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} /></Field>
              <Field label="Vendor email"><Input type="email" value={form.vendor_email} onChange={(e) => setForm({ ...form, vendor_email: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Subtotal"><Input type="number" step="0.01" value={form.subtotal} onChange={(e) => setForm({ ...form, subtotal: e.target.value })} /></Field>
                <Field label="Tax"><Input type="number" step="0.01" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expected"><Input type="date" value={form.expected_at} onChange={(e) => setForm({ ...form, expected_at: e.target.value })} /></Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["draft","sent","received","cancelled"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create} style={{ backgroundImage: "var(--gradient-primary)" }}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="p-6">
        {q.isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : rows.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No purchase orders yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create a PO to track vendor orders and receiving.</p>
            <Button className="mt-4" size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> New PO</Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">PO #</th><th className="px-4 py-3 text-left">Vendor</th><th className="px-4 py-3 text-left">Expected</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-left">Status</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-border/60 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.po_number}</td>
                    <td className="px-4 py-3">{p.vendor_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.expected_at ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">${Number(p.total).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{p.status}</Badge></td>
                    <td className="px-4 py-3 text-right"><Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
