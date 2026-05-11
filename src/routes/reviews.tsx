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
import { Plus, Star, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reviews")({ component: ReviewsPage });

const SOURCES = ["in_app", "google", "yelp", "facebook", "email"];

function ReviewsPage() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customer_id: "", technician_id: "", rating: 5, comment: "", source: "in_app" });

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: c }, { data: t }] = await Promise.all([
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("customers").select("id,name").order("name"),
      supabase.from("technicians").select("id,full_name").order("full_name"),
    ]);
    setRows(r ?? []); setCustomers(c ?? []); setTechs(t ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const cmap = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c.name])), [customers]);
  const tmap = useMemo(() => Object.fromEntries(techs.map((t) => [t.id, t.full_name])), [techs]);

  const avg = useMemo(() => rows.length ? (rows.reduce((s, r) => s + (r.rating ?? 0), 0) / rows.length) : 0, [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [cmap[r.customer_id], tmap[r.technician_id], r.comment, r.source].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [rows, q, cmap, tmap]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.rating) return toast.error("Rating required");
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      company_id: companyId,
      customer_id: form.customer_id || null,
      technician_id: form.technician_id || null,
      rating: Number(form.rating),
      comment: form.comment || null,
      source: form.source,
      status: "published",
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Review added");
    setOpen(false);
    setForm({ customer_id: "", technician_id: "", rating: 5, comment: "", source: "in_app" });
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Customer Experience"
        title="Reviews"
        description="Customer ratings across channels — track team performance and trends."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
                <Plus className="mr-1.5 h-4 w-4" /> Add review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>New review</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Customer">
                  <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Technician">
                  <Select value={form.technician_id} onValueChange={(v) => setForm({ ...form, technician_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>{techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Rating (1-5)" required>
                  <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
                </Field>
                <Field label="Source">
                  <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Comment" className="sm:col-span-2"><Textarea rows={3} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></Field>
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
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <div className="text-xs uppercase text-muted-foreground">Average</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold">{avg.toFixed(1)}</span>
              <Stars value={Math.round(avg)} />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <div className="text-xs uppercase text-muted-foreground">Total reviews</div>
            <div className="text-2xl font-semibold">{rows.length}</div>
          </div>
          <div className="relative ml-auto max-w-sm flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search reviews…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Star className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No reviews yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Customer feedback will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Stars value={r.rating} />
                    <p className="mt-1 text-sm font-medium">{cmap[r.customer_id] ?? "Anonymous"}</p>
                    {r.technician_id && <p className="text-xs text-muted-foreground">Tech: {tmap[r.technician_id] ?? "—"}</p>}
                  </div>
                  <Badge variant="outline" className="capitalize">{(r.source ?? "").replace("_", " ")}</Badge>
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                <p className="mt-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={"h-4 w-4 " + (i <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40")} />
      ))}
    </div>
  );
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return <div className={"space-y-1.5 " + (className ?? "")}><Label>{label}{required ? <span className="text-destructive"> *</span> : null}</Label>{children}</div>;
}
