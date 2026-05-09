import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Truck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vendors")({ component: VendorsPage });

const STATUSES = ["active", "preferred", "inactive"] as const;

function VendorsPage() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const empty = { name: "", contact_name: "", email: "", phone: "", website: "", address: "", category: "", payment_terms: "Net 30", lead_time_days: 7, notes: "", status: "active" };
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
    setRows(data ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [r.name, r.contact_name, r.email, r.category].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [rows, q]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.name.trim()) return toast.error("Name required");
    setSaving(true);
    const { error } = await supabase.from("vendors").insert({ company_id: companyId, ...form, lead_time_days: Number(form.lead_time_days) || 0, created_by: user?.id ?? null });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Vendor added"); setOpen(false); setForm(empty); load();
  };

  return (
    <>
      <PageHeader eyebrow="Inventory" title="Vendors" description="Supplier directory with pricing, lead times, terms, and PO history."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-1.5 h-4 w-4" />New vendor</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New vendor</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <F label="Vendor name" req cls="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Carrier Supply Co." /></F>
                <F label="Contact person"><Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></F>
                <F label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="HVAC parts, Refrigerants" /></F>
                <F label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></F>
                <F label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></F>
                <F label="Website"><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></F>
                <F label="Payment terms"><Input value={form.payment_terms} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} /></F>
                <F label="Lead time (days)"><Input type="number" value={form.lead_time_days} onChange={(e) => setForm({ ...form, lead_time_days: Number(e.target.value) })} /></F>
                <F label="Status"><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></F>
                <F label="Address" cls="sm:col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></F>
                <F label="Notes" cls="sm:col-span-2"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></F>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>{saving ? "Saving…" : "Save"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        } />
      <div className="space-y-4 p-6">
        <div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search vendors…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center"><Truck className="h-10 w-10 text-muted-foreground" /><h3 className="mt-3 text-base font-semibold">No vendors yet</h3><p className="mt-1 text-sm text-muted-foreground">Add suppliers to manage POs and lead times.</p></div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full text-sm"><thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3 text-left">Vendor</th><th className="px-4 py-3 text-left">Contact</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Terms</th><th className="px-4 py-3 text-right">Lead time</th><th className="px-4 py-3 text-left">Status</th></tr></thead><tbody>{filtered.map((r) => (<tr key={r.id} className="border-t border-border hover:bg-muted/20"><td className="px-4 py-3 font-medium">{r.name}</td><td className="px-4 py-3 text-muted-foreground">{r.contact_name ?? "—"}<div className="text-xs">{r.email ?? ""}</div></td><td className="px-4 py-3 text-muted-foreground">{r.category ?? "—"}</td><td className="px-4 py-3 text-muted-foreground">{r.payment_terms ?? "—"}</td><td className="px-4 py-3 text-right">{r.lead_time_days ?? 0}d</td><td className="px-4 py-3"><Badge variant="outline" className="capitalize">{r.status}</Badge></td></tr>))}</tbody></table></div>
        )}
      </div>
    </>
  );
}

function F({ label, req, cls, children }: { label: string; req?: boolean; cls?: string; children: React.ReactNode }) {
  return <div className={"space-y-1.5 " + (cls ?? "")}><Label>{label}{req ? <span className="text-destructive"> *</span> : null}</Label>{children}</div>;
}
