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
import { Plus, ShieldCheck, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sla")({ component: Page });

const STATUSES = ["active", "expired", "draft"] as const;
const PRIORITIES = ["low", "medium", "high", "critical"] as const;

function Page() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", commercial_account_id: "", customer_id: "", priority: "medium",
    response_time_hours: 4, resolution_time_hours: 24, coverage_window: "Mon-Fri 8a-5p",
    penalty_amount: 0, effective_date: "", expiration_date: "", status: "active", notes: "",
  });

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: a }, { data: c }] = await Promise.all([
      supabase.from("slas").select("*").order("created_at", { ascending: false }),
      supabase.from("commercial_accounts").select("id,account_name").order("account_name"),
      supabase.from("customers").select("id,name").order("name"),
    ]);
    setRows(r ?? []); setAccounts(a ?? []); setCustomers(c ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const amap = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a.account_name])), [accounts]);
  const cmap = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c.name])), [customers]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [r.name, amap[r.commercial_account_id], r.priority, r.status].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [rows, q, amap]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.name.trim()) return toast.error("Name required");
    setSaving(true);
    const { error } = await supabase.from("slas").insert({
      company_id: companyId,
      name: form.name.trim(),
      commercial_account_id: form.commercial_account_id || null,
      customer_id: form.customer_id || null,
      priority: form.priority,
      response_time_hours: Number(form.response_time_hours) || 0,
      resolution_time_hours: Number(form.resolution_time_hours) || 0,
      coverage_window: form.coverage_window || null,
      penalty_amount: Number(form.penalty_amount) || 0,
      effective_date: form.effective_date || null,
      expiration_date: form.expiration_date || null,
      status: form.status,
      notes: form.notes || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("SLA created");
    setOpen(false);
    setForm({ name: "", commercial_account_id: "", customer_id: "", priority: "medium", response_time_hours: 4, resolution_time_hours: 24, coverage_window: "Mon-Fri 8a-5p", penalty_amount: 0, effective_date: "", expiration_date: "", status: "active", notes: "" });
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Commercial"
        title="SLA Management"
        description="Service-level agreements with response time tracking and breach alerts."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-1.5 h-4 w-4" /> New SLA</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New SLA</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="SLA name" required className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Platinum 4-Hour Response" /></Field>
                <Field label="Commercial account">
                  <Select value={form.commercial_account_id} onValueChange={(v) => setForm({ ...form, commercial_account_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.account_name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Customer (alt)">
                  <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Priority">
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Response (hrs)"><Input type="number" value={form.response_time_hours} onChange={(e) => setForm({ ...form, response_time_hours: Number(e.target.value) })} /></Field>
                <Field label="Resolution (hrs)"><Input type="number" value={form.resolution_time_hours} onChange={(e) => setForm({ ...form, resolution_time_hours: Number(e.target.value) })} /></Field>
                <Field label="Coverage window" className="sm:col-span-2"><Input value={form.coverage_window} onChange={(e) => setForm({ ...form, coverage_window: e.target.value })} placeholder="24/7 or Mon-Fri 8a-5p" /></Field>
                <Field label="Penalty amount"><Input type="number" step="0.01" value={form.penalty_amount} onChange={(e) => setForm({ ...form, penalty_amount: Number(e.target.value) })} /></Field>
                <Field label="Effective date"><Input type="date" value={form.effective_date} onChange={(e) => setForm({ ...form, effective_date: e.target.value })} /></Field>
                <Field label="Expiration date"><Input type="date" value={form.expiration_date} onChange={(e) => setForm({ ...form, expiration_date: e.target.value })} /></Field>
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
          <Input className="pl-9" placeholder="Search SLAs…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <ShieldCheck className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No SLAs yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Define service-level commitments to track performance.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr>
                <th className="px-4 py-3 text-left">SLA</th><th className="px-4 py-3 text-left">Account</th>
                <th className="px-4 py-3 text-left">Priority</th><th className="px-4 py-3 text-right">Response</th>
                <th className="px-4 py-3 text-right">Resolution</th><th className="px-4 py-3 text-left">Coverage</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr></thead>
              <tbody>{filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{amap[r.commercial_account_id] ?? cmap[r.customer_id] ?? "—"}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{r.priority}</Badge></td>
                  <td className="px-4 py-3 text-right">{r.response_time_hours}h</td>
                  <td className="px-4 py-3 text-right">{r.resolution_time_hours}h</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.coverage_window ?? "—"}</td>
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
