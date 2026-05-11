import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Repeat, Search, Inbox } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/memberships")({ component: MembershipsPage });

const STATUSES = ["draft", "active", "paused", "expired", "cancelled"] as const;
const FREQUENCIES = ["monthly", "quarterly", "biannual", "annual"] as const;

function MembershipsPage() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", customer_id: "", property_id: "", frequency: "quarterly",
    visits_per_year: 4, annual_price: 0, start_date: new Date().toISOString().slice(0, 10),
    end_date: "", next_visit: "", status: "active",
  });

  const load = async () => {
    setLoading(true);
    const [{ data: m }, { data: c }, { data: p }] = await Promise.all([
      supabase.from("maintenance_agreements").select("*").order("created_at", { ascending: false }),
      supabase.from("customers").select("id,name").order("name"),
      supabase.from("properties").select("id,name,address,customer_id").order("created_at", { ascending: false }),
    ]);
    setRows(m ?? []); setCustomers(c ?? []); setProperties(p ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const cmap = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c.name])), [customers]);
  const pmap = useMemo(() => Object.fromEntries(properties.map((p) => [p.id, p.name ?? p.address])), [properties]);
  const propsForCustomer = useMemo(
    () => properties.filter((p) => !form.customer_id || p.customer_id === form.customer_id),
    [properties, form.customer_id]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.name, cmap[r.customer_id], pmap[r.property_id], r.frequency, r.status]
        .filter(Boolean).join(" ").toLowerCase().includes(s)
    );
  }, [rows, q, cmap, pmap]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.name.trim()) return toast.error("Name required");
    if (!form.customer_id) return toast.error("Customer required");
    setSaving(true);
    const { error } = await supabase.from("maintenance_agreements").insert({
      company_id: companyId,
      customer_id: form.customer_id,
      property_id: form.property_id || null,
      name: form.name.trim(),
      frequency: form.frequency,
      visits_per_year: Number(form.visits_per_year) || 0,
      annual_price: Number(form.annual_price) || 0,
      start_date: form.start_date,
      end_date: form.end_date || null,
      next_visit: form.next_visit || null,
      status: form.status as any,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Membership created");
    setOpen(false);
    setForm({ ...form, name: "", customer_id: "", property_id: "", end_date: "", next_visit: "" });
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="CRM"
        title="Memberships"
        description="Recurring service agreements with auto-renewals, visit cadence, and price tiers."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
                <Plus className="mr-1.5 h-4 w-4" /> New membership
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New membership</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Plan name" required className="sm:col-span-2">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gold Annual Plan" />
                </Field>
                <Field label="Customer" required>
                  <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v, property_id: "" })}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Property">
                  <Select value={form.property_id} onValueChange={(v) => setForm({ ...form, property_id: v })}>
                    <SelectTrigger><SelectValue placeholder={form.customer_id ? "Select property" : "Pick customer first"} /></SelectTrigger>
                    <SelectContent>{propsForCustomer.map((p) => <SelectItem key={p.id} value={p.id}>{p.name ?? p.address}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Frequency">
                  <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Visits / year">
                  <Input type="number" value={form.visits_per_year} onChange={(e) => setForm({ ...form, visits_per_year: Number(e.target.value) })} />
                </Field>
                <Field label="Annual price">
                  <Input type="number" step="0.01" value={form.annual_price} onChange={(e) => setForm({ ...form, annual_price: Number(e.target.value) })} />
                </Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Start date">
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </Field>
                <Field label="End date">
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </Field>
                <Field label="Next visit">
                  <Input type="date" value={form.next_visit} onChange={(e) => setForm({ ...form, next_visit: e.target.value })} />
                </Field>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="space-y-4 p-4 md:p-6">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search memberships…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Property</th>
                  <th className="px-4 py-3 text-left">Frequency</th>
                  <th className="px-4 py-3 text-right">Annual</th>
                  <th className="px-4 py-3 text-left">Next visit</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cmap[r.customer_id] ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.property_id ? (pmap[r.property_id] ?? "—") : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{r.frequency} • {r.visits_per_year}/yr</td>
                    <td className="px-4 py-3 text-right">${Number(r.annual_price ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.next_visit ?? "—"}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{r.status}</Badge></td>
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
      <Repeat className="h-10 w-10 text-muted-foreground" />
      <h3 className="mt-3 text-base font-semibold">No memberships yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Create your first plan to start recurring revenue.</p>
    </div>
  );
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label>{label}{required ? <span className="text-destructive"> *</span> : null}</Label>
      {children}
    </div>
  );
}
