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
import { Plus, Wrench, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/installations")({ component: Page });

const STATUSES = ["scheduled", "in_progress", "completed", "warranty", "cancelled"] as const;
const TYPES = ["Furnace", "AC Unit", "Heat Pump", "Mini Split", "Boiler", "Water Heater", "Thermostat", "Air Handler"];

function Page() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    install_number: "", customer_id: "", property_id: "", equipment_type: "",
    brand: "", model: "", serial_number: "", technician_id: "",
    scheduled_date: "", permit_number: "", warranty_years: 10, total_value: 0,
    status: "scheduled", notes: "",
  });

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: c }, { data: p }, { data: t }] = await Promise.all([
      supabase.from("installations").select("*").order("created_at", { ascending: false }),
      supabase.from("customers").select("id,name").order("name"),
      supabase.from("properties").select("id,name,address,customer_id"),
      supabase.from("technicians").select("id,full_name").order("full_name"),
    ]);
    setRows(r ?? []); setCustomers(c ?? []); setProperties(p ?? []); setTechs(t ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const cmap = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c.name])), [customers]);
  const tmap = useMemo(() => Object.fromEntries(techs.map((t) => [t.id, t.full_name])), [techs]);
  const propsForCustomer = useMemo(() => properties.filter((p) => !form.customer_id || p.customer_id === form.customer_id), [properties, form.customer_id]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [r.install_number, cmap[r.customer_id], r.equipment_type, r.brand, r.model, r.status].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [rows, q, cmap]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.install_number.trim()) return toast.error("Install # required");
    setSaving(true);
    const { error } = await supabase.from("installations").insert({
      company_id: companyId,
      install_number: form.install_number.trim(),
      customer_id: form.customer_id || null,
      property_id: form.property_id || null,
      equipment_type: form.equipment_type || null,
      brand: form.brand || null,
      model: form.model || null,
      serial_number: form.serial_number || null,
      technician_id: form.technician_id || null,
      scheduled_date: form.scheduled_date || null,
      permit_number: form.permit_number || null,
      warranty_years: Number(form.warranty_years) || 0,
      total_value: Number(form.total_value) || 0,
      status: form.status,
      notes: form.notes || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Installation created");
    setOpen(false);
    setForm({ install_number: "", customer_id: "", property_id: "", equipment_type: "", brand: "", model: "", serial_number: "", technician_id: "", scheduled_date: "", permit_number: "", warranty_years: 10, total_value: 0, status: "scheduled", notes: "" });
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Installations"
        description="Equipment install workflows with permits, warranties, and commissioning."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-1.5 h-4 w-4" /> New install</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New installation</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Install #" required><Input value={form.install_number} onChange={(e) => setForm({ ...form, install_number: e.target.value })} placeholder="INST-001" /></Field>
                <Field label="Equipment type">
                  <Select value={form.equipment_type} onValueChange={(v) => setForm({ ...form, equipment_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Customer">
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
                <Field label="Brand"><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Carrier" /></Field>
                <Field label="Model"><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></Field>
                <Field label="Serial #"><Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></Field>
                <Field label="Technician">
                  <Select value={form.technician_id} onValueChange={(v) => setForm({ ...form, technician_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Assign tech" /></SelectTrigger>
                    <SelectContent>{techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Scheduled date"><Input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} /></Field>
                <Field label="Permit #"><Input value={form.permit_number} onChange={(e) => setForm({ ...form, permit_number: e.target.value })} /></Field>
                <Field label="Warranty (yrs)"><Input type="number" value={form.warranty_years} onChange={(e) => setForm({ ...form, warranty_years: Number(e.target.value) })} /></Field>
                <Field label="Total value"><Input type="number" step="0.01" value={form.total_value} onChange={(e) => setForm({ ...form, total_value: Number(e.target.value) })} /></Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Notes" className="sm:col-span-2"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>{saving ? "Saving…" : "Save"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="space-y-4 p-4 md:p-6">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search installations…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Wrench className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No installations yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Track equipment installs from quote to commissioning.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr>
                <th className="px-4 py-3 text-left">Install #</th><th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Equipment</th><th className="px-4 py-3 text-left">Tech</th>
                <th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr></thead>
              <tbody>{filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{r.install_number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cmap[r.customer_id] ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{[r.equipment_type, r.brand, r.model].filter(Boolean).join(" ") || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tmap[r.technician_id] ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.scheduled_date ?? "—"}</td>
                  <td className="px-4 py-3 text-right">${Number(r.total_value ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{r.status?.replace("_", " ")}</Badge></td>
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
