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
import { Plus, Search, Boxes } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/assets")({ component: AssetsPage });
const STATUSES = ["in_service", "in_repair", "retired", "lost"] as const;
const CATEGORIES = ["Tools", "IT Equipment", "Diagnostic", "Safety Gear", "Vehicle Equipment", "Other"];

function AssetsPage() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [locs, setLocs] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const empty = { name: "", asset_tag: "", category: "Tools", serial_number: "", manufacturer: "", model: "", location_id: "", assigned_to: "", purchase_date: "", purchase_price: 0, warranty_expires: "", next_service_date: "", notes: "", status: "in_service" };
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    setLoading(true);
    const [{ data: a }, { data: l }, { data: t }] = await Promise.all([
      supabase.from("assets").select("*").order("created_at", { ascending: false }),
      supabase.from("business_locations").select("id,name").order("name"),
      supabase.from("technicians").select("id,full_name").order("full_name"),
    ]);
    setRows(a ?? []); setLocs(l ?? []); setTechs(t ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const lmap = useMemo(() => Object.fromEntries(locs.map((x) => [x.id, x.name])), [locs]);
  const tmap = useMemo(() => Object.fromEntries(techs.map((x) => [x.id, x.full_name])), [techs]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [r.name, r.asset_tag, r.serial_number, r.category, r.manufacturer].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [rows, q]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.name.trim()) return toast.error("Name required");
    setSaving(true);
    const payload: any = { ...form, company_id: companyId, purchase_price: Number(form.purchase_price) || 0, location_id: form.location_id || null, assigned_to: form.assigned_to || null, purchase_date: form.purchase_date || null, warranty_expires: form.warranty_expires || null, next_service_date: form.next_service_date || null, created_by: user?.id ?? null };
    const { error } = await supabase.from("assets").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Asset added"); setOpen(false); setForm(empty); load();
  };

  return (
    <>
      <PageHeader eyebrow="Operations" title="Assets" description="Company-owned tools, IT equipment, and diagnostic gear."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-1.5 h-4 w-4" />New asset</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New asset</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <F label="Asset name" req cls="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Fluke 902 Clamp Meter" /></F>
                <F label="Asset tag"><Input value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="A-0042" /></F>
                <F label="Category"><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></F>
                <F label="Manufacturer"><Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} /></F>
                <F label="Model"><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></F>
                <F label="Serial number"><Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></F>
                <F label="Status"><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_"," ")}</SelectItem>)}</SelectContent></Select></F>
                <F label="Location"><Select value={form.location_id} onValueChange={(v) => setForm({ ...form, location_id: v })}><SelectTrigger><SelectValue placeholder="Pick location" /></SelectTrigger><SelectContent>{locs.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select></F>
                <F label="Assigned to"><Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}><SelectTrigger><SelectValue placeholder="Assign" /></SelectTrigger><SelectContent>{techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent></Select></F>
                <F label="Purchase date"><Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} /></F>
                <F label="Purchase price"><Input type="number" step="0.01" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: Number(e.target.value) })} /></F>
                <F label="Warranty expires"><Input type="date" value={form.warranty_expires} onChange={(e) => setForm({ ...form, warranty_expires: e.target.value })} /></F>
                <F label="Next service"><Input type="date" value={form.next_service_date} onChange={(e) => setForm({ ...form, next_service_date: e.target.value })} /></F>
                <F label="Notes" cls="sm:col-span-2"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></F>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>{saving ? "Saving…" : "Save"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        } />
      <div className="space-y-4 p-6">
        <div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search assets…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center"><Boxes className="h-10 w-10 text-muted-foreground" /><h3 className="mt-3 text-base font-semibold">No assets yet</h3><p className="mt-1 text-sm text-muted-foreground">Track tools, meters, and IT equipment.</p></div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full text-sm"><thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3 text-left">Asset</th><th className="px-4 py-3 text-left">Tag</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Location</th><th className="px-4 py-3 text-left">Assigned</th><th className="px-4 py-3 text-left">Status</th></tr></thead><tbody>{filtered.map((r) => (<tr key={r.id} className="border-t border-border hover:bg-muted/20"><td className="px-4 py-3 font-medium">{r.name}<div className="text-xs text-muted-foreground">{[r.manufacturer, r.model].filter(Boolean).join(" ")}</div></td><td className="px-4 py-3 text-muted-foreground">{r.asset_tag ?? "—"}</td><td className="px-4 py-3 text-muted-foreground">{r.category ?? "—"}</td><td className="px-4 py-3 text-muted-foreground">{lmap[r.location_id] ?? "—"}</td><td className="px-4 py-3 text-muted-foreground">{tmap[r.assigned_to] ?? "—"}</td><td className="px-4 py-3"><Badge variant="outline" className="capitalize">{r.status?.replace("_"," ")}</Badge></td></tr>))}</tbody></table></div>
        )}
      </div>
    </>
  );
}

function F({ label, req, cls, children }: { label: string; req?: boolean; cls?: string; children: React.ReactNode }) {
  return <div className={"space-y-1.5 " + (cls ?? "")}><Label>{label}{req ? <span className="text-destructive"> *</span> : null}</Label>{children}</div>;
}
