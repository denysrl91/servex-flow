import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CalendarClock, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/preventive-maintenance")({ component: Page });

const STATUSES = ["active", "paused", "completed", "cancelled"] as const;
const FREQUENCIES = ["monthly", "quarterly", "biannual", "annual"] as const;

function Page() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", customer_id: "", property_id: "", equipment_id: "",
    frequency: "quarterly", visits_per_year: 4, next_visit: "",
    assigned_tech_id: "", checklist: "", status: "active", notes: "",
  });

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: c }, { data: p }, { data: e }, { data: t }] = await Promise.all([
      supabase.from("pm_schedules").select("*").order("created_at", { ascending: false }),
      supabase.from("customers").select("id,name").order("name"),
      supabase.from("properties").select("id,name,address,customer_id"),
      supabase.from("equipment").select("id,type,brand,model,property_id"),
      supabase.from("technicians").select("id,full_name").order("full_name"),
    ]);
    setRows(r ?? []); setCustomers(c ?? []); setProperties(p ?? []); setEquipment(e ?? []); setTechs(t ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const cmap = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c.name])), [customers]);
  const tmap = useMemo(() => Object.fromEntries(techs.map((t) => [t.id, t.full_name])), [techs]);
  const propsForCustomer = useMemo(() => properties.filter((p) => !form.customer_id || p.customer_id === form.customer_id), [properties, form.customer_id]);
  const equipForProp = useMemo(() => equipment.filter((e) => !form.property_id || e.property_id === form.property_id), [equipment, form.property_id]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [r.name, cmap[r.customer_id], r.frequency, r.status].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [rows, q, cmap]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.name.trim()) return toast.error("Name required");
    setSaving(true);
    const { error } = await supabase.from("pm_schedules").insert({
      company_id: companyId,
      name: form.name.trim(),
      customer_id: form.customer_id || null,
      property_id: form.property_id || null,
      equipment_id: form.equipment_id || null,
      frequency: form.frequency,
      visits_per_year: Number(form.visits_per_year) || 0,
      next_visit: form.next_visit || null,
      assigned_tech_id: form.assigned_tech_id || null,
      checklist: form.checklist || null,
      status: form.status,
      notes: form.notes || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("PM schedule created");
    setOpen(false);
    setForm({ name: "", customer_id: "", property_id: "", equipment_id: "", frequency: "quarterly", visits_per_year: 4, next_visit: "", assigned_tech_id: "", checklist: "", status: "active", notes: "" });
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Commercial"
        title="Preventive Maintenance"
        description="Recurring PM schedules with auto-generated work orders and visit tracking."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-1.5 h-4 w-4" /> New PM</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New PM schedule</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Schedule name" required className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Spring AC tune-up" /></Field>
                <Field label="Customer">
                  <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v, property_id: "", equipment_id: "" })}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Property">
                  <Select value={form.property_id} onValueChange={(v) => setForm({ ...form, property_id: v, equipment_id: "" })}>
                    <SelectTrigger><SelectValue placeholder={form.customer_id ? "Select property" : "Pick customer first"} /></SelectTrigger>
                    <SelectContent>{propsForCustomer.map((p) => <SelectItem key={p.id} value={p.id}>{p.name ?? p.address}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Equipment">
                  <Select value={form.equipment_id} onValueChange={(v) => setForm({ ...form, equipment_id: v })}>
                    <SelectTrigger><SelectValue placeholder={form.property_id ? "Select unit" : "Pick property first"} /></SelectTrigger>
                    <SelectContent>{equipForProp.map((e) => <SelectItem key={e.id} value={e.id}>{[e.type, e.brand, e.model].filter(Boolean).join(" ")}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Assigned tech">
                  <Select value={form.assigned_tech_id} onValueChange={(v) => setForm({ ...form, assigned_tech_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select tech" /></SelectTrigger>
                    <SelectContent>{techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Frequency">
                  <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Visits / year"><Input type="number" value={form.visits_per_year} onChange={(e) => setForm({ ...form, visits_per_year: Number(e.target.value) })} /></Field>
                <Field label="Next visit"><Input type="date" value={form.next_visit} onChange={(e) => setForm({ ...form, next_visit: e.target.value })} /></Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Checklist" className="sm:col-span-2"><Textarea value={form.checklist} onChange={(e) => setForm({ ...form, checklist: e.target.value })} placeholder="Filter change, coil clean, refrigerant check…" /></Field>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>{saving ? "Saving…" : "Save"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="space-y-4 p-6">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search PM schedules…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <CalendarClock className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No PM schedules yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Set up recurring maintenance to stay ahead of equipment failures.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr>
                <th className="px-4 py-3 text-left">Schedule</th><th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Frequency</th><th className="px-4 py-3 text-left">Tech</th>
                <th className="px-4 py-3 text-left">Next visit</th><th className="px-4 py-3 text-left">Status</th>
              </tr></thead>
              <tbody>{filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cmap[r.customer_id] ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{r.frequency} • {r.visits_per_year}/yr</td>
                  <td className="px-4 py-3 text-muted-foreground">{tmap[r.assigned_tech_id] ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.next_visit ?? "—"}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{r.status}</Badge></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </>
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
