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
import { Plus, Search, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/locations")({ component: LocationsPage });
const TYPES = ["office", "branch", "warehouse", "service_center", "remote"] as const;
const STATUSES = ["active", "inactive"] as const;

function LocationsPage() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const empty = { name: "", type: "office", address: "", city: "", region: "", postal_code: "", country: "US", phone: "", manager_id: "", timezone: "America/New_York", notes: "", status: "active" };
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    setLoading(true);
    const [{ data: l }, { data: t }] = await Promise.all([
      supabase.from("business_locations").select("*").order("created_at", { ascending: false }),
      supabase.from("technicians").select("id,full_name").order("full_name"),
    ]);
    setRows(l ?? []); setTechs(t ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const tmap = useMemo(() => Object.fromEntries(techs.map((t) => [t.id, t.full_name])), [techs]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [r.name, r.address, r.city, r.type].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [rows, q]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.name.trim()) return toast.error("Name required");
    setSaving(true);
    const { error } = await supabase.from("business_locations").insert({ ...form, company_id: companyId, manager_id: form.manager_id || null, created_by: user?.id ?? null });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Location added"); setOpen(false); setForm(empty); load();
  };

  return (
    <>
      <PageHeader eyebrow="Operations" title="Locations" description="Your offices, branches, and service centers."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-1.5 h-4 w-4" />New location</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New location</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <F label="Location name" req cls="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Downtown Service Hub" /></F>
                <F label="Type"><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace("_"," ")}</SelectItem>)}</SelectContent></Select></F>
                <F label="Status"><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></F>
                <F label="Address" cls="sm:col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></F>
                <F label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></F>
                <F label="State / region"><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></F>
                <F label="Postal code"><Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} /></F>
                <F label="Country"><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></F>
                <F label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></F>
                <F label="Timezone"><Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></F>
                <F label="Manager"><Select value={form.manager_id} onValueChange={(v) => setForm({ ...form, manager_id: v })}><SelectTrigger><SelectValue placeholder="Assign" /></SelectTrigger><SelectContent>{techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent></Select></F>
                <F label="Notes" cls="sm:col-span-2"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></F>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>{saving ? "Saving…" : "Save"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        } />
      <div className="space-y-4 p-4 md:p-6">
        <div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search locations…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center"><MapPin className="h-10 w-10 text-muted-foreground" /><h3 className="mt-3 text-base font-semibold">No locations yet</h3><p className="mt-1 text-sm text-muted-foreground">Add your offices and branches.</p></div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full text-sm"><thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3 text-left">Location</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Address</th><th className="px-4 py-3 text-left">Manager</th><th className="px-4 py-3 text-left">Status</th></tr></thead><tbody>{filtered.map((r) => (<tr key={r.id} className="border-t border-border hover:bg-muted/20"><td className="px-4 py-3 font-medium">{r.name}</td><td className="px-4 py-3 text-muted-foreground capitalize">{r.type?.replace("_"," ")}</td><td className="px-4 py-3 text-muted-foreground">{[r.address, r.city, r.region].filter(Boolean).join(", ") || "—"}</td><td className="px-4 py-3 text-muted-foreground">{tmap[r.manager_id] ?? "—"}</td><td className="px-4 py-3"><Badge variant="outline" className="capitalize">{r.status}</Badge></td></tr>))}</tbody></table></div>
        )}
      </div>
    </>
  );
}

function F({ label, req, cls, children }: { label: string; req?: boolean; cls?: string; children: React.ReactNode }) {
  return <div className={"space-y-1.5 " + (cls ?? "")}><Label>{label}{req ? <span className="text-destructive"> *</span> : null}</Label>{children}</div>;
}
