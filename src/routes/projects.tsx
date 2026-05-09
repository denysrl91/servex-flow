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
import { Plus, FolderKanban, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects")({ component: Page });

const STATUSES = ["planning", "in_progress", "on_hold", "completed", "cancelled"] as const;

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
    name: "", customer_id: "", property_id: "", project_manager_id: "",
    status: "planning", start_date: "", end_date: "", budget: 0, description: "",
  });

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: c }, { data: p }, { data: t }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
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
  const propsForCustomer = useMemo(
    () => properties.filter((p) => !form.customer_id || p.customer_id === form.customer_id),
    [properties, form.customer_id]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [r.name, cmap[r.customer_id], r.status].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [rows, q, cmap]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.name.trim()) return toast.error("Project name required");
    setSaving(true);
    const { error } = await supabase.from("projects").insert({
      company_id: companyId,
      name: form.name.trim(),
      customer_id: form.customer_id || null,
      property_id: form.property_id || null,
      project_manager_id: form.project_manager_id || null,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: Number(form.budget) || 0,
      description: form.description || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Project created");
    setOpen(false);
    setForm({ name: "", customer_id: "", property_id: "", project_manager_id: "", status: "planning", start_date: "", end_date: "", budget: 0, description: "" });
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Projects"
        description="Multi-day, multi-phase work orders with budgets, milestones, and timelines."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-1.5 h-4 w-4" /> New project</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Project name" required className="sm:col-span-2">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="HVAC Replacement - Smith Residence" />
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
                <Field label="Project manager">
                  <Select value={form.project_manager_id} onValueChange={(v) => setForm({ ...form, project_manager_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select PM" /></SelectTrigger>
                    <SelectContent>{techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Budget"><Input type="number" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} /></Field>
                <Field label="Start date"><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
                <Field label="End date"><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></Field>
                <Field label="Description" className="sm:col-span-2">
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Scope, deliverables, notes" />
                </Field>
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
          <Input className="pl-9" placeholder="Search projects…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <FolderKanban className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No projects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create a project to track multi-phase work.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr>
                <th className="px-4 py-3 text-left">Project</th><th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">PM</th><th className="px-4 py-3 text-right">Budget</th>
                <th className="px-4 py-3 text-right">Actual</th><th className="px-4 py-3 text-left">Dates</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr></thead>
              <tbody>{filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cmap[r.customer_id] ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tmap[r.project_manager_id] ?? "—"}</td>
                  <td className="px-4 py-3 text-right">${Number(r.budget ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${Number(r.actual_cost ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{r.start_date ?? "—"} → {r.end_date ?? "—"}</td>
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
