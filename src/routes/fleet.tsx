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
import { Plus, Truck, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/fleet")({ component: FleetPage });

const STATUSES = ["active", "in_shop", "retired"];

function FleetPage() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", make: "", model: "", year: "", license_plate: "", technician_id: "", status: "active" });

  const load = async () => {
    setLoading(true);
    const [{ data: v }, { data: t }] = await Promise.all([
      supabase.from("vans").select("*").order("created_at", { ascending: false }),
      supabase.from("technicians").select("id,full_name").order("full_name"),
    ]);
    setRows(v ?? []); setTechs(t ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const tmap = useMemo(() => Object.fromEntries(techs.map((t) => [t.id, t.full_name])), [techs]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.name, r.make, r.model, r.license_plate, tmap[r.technician_id]].filter(Boolean).join(" ").toLowerCase().includes(s)
    );
  }, [rows, q, tmap]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.name.trim()) return toast.error("Name required");
    setSaving(true);
    const { error } = await supabase.from("vans").insert({
      company_id: companyId,
      name: form.name.trim(),
      make: form.make || null,
      model: form.model || null,
      year: form.year ? Number(form.year) : null,
      license_plate: form.license_plate || null,
      technician_id: form.technician_id || null,
      status: form.status,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Vehicle added");
    setOpen(false);
    setForm({ name: "", make: "", model: "", year: "", license_plate: "", technician_id: "", status: "active" });
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Fleet"
        description="Service vans and vehicles, assigned drivers, and shop status."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
                <Plus className="mr-1.5 h-4 w-4" /> Add vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>New vehicle</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name / unit #" required className="sm:col-span-2">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Van 12" />
                </Field>
                <Field label="Make"><Input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} /></Field>
                <Field label="Model"><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></Field>
                <Field label="Year"><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></Field>
                <Field label="License plate"><Input value={form.license_plate} onChange={(e) => setForm({ ...form, license_plate: e.target.value })} /></Field>
                <Field label="Assigned tech">
                  <Select value={form.technician_id} onValueChange={(v) => setForm({ ...form, technician_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>{techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
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
      <div className="space-y-4 p-4 md:p-6">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search fleet…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Truck className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No vehicles yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add your first service van to start tracking the fleet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Vehicle</th>
                  <th className="px-4 py-3 text-left">Make / model</th>
                  <th className="px-4 py-3 text-left">Plate</th>
                  <th className="px-4 py-3 text-left">Driver</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{[r.year, r.make, r.model].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.license_plate ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.technician_id ? (tmap[r.technician_id] ?? "—") : "Unassigned"}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{(r.status ?? "").replace("_", " ")}</Badge></td>
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

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return <div className={"space-y-1.5 " + (className ?? "")}><Label>{label}{required ? <span className="text-destructive"> *</span> : null}</Label>{children}</div>;
}
