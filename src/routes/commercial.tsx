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
import { Plus, Search, Building2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/commercial")({ component: CommercialPage });
const STATUSES = ["prospect", "active", "on_hold", "closed"] as const;

function CommercialPage() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const empty = { account_name: "", customer_id: "", industry: "", account_manager_id: "", contract_value: 0, credit_limit: 0, payment_terms: "Net 30", contract_start: "", contract_end: "", primary_contact: "", email: "", phone: "", notes: "", status: "active" };
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    setLoading(true);
    const [{ data: a }, { data: c }, { data: t }] = await Promise.all([
      supabase.from("commercial_accounts").select("*").order("created_at", { ascending: false }),
      supabase.from("customers").select("id,name").order("name"),
      supabase.from("technicians").select("id,full_name").order("full_name"),
    ]);
    setRows(a ?? []); setCustomers(c ?? []); setTechs(t ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const cmap = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c.name])), [customers]);
  const tmap = useMemo(() => Object.fromEntries(techs.map((t) => [t.id, t.full_name])), [techs]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [r.account_name, r.industry, r.primary_contact, cmap[r.customer_id]].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [rows, q, cmap]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.account_name.trim()) return toast.error("Account name required");
    setSaving(true);
    const payload: any = { ...form, company_id: companyId, contract_value: Number(form.contract_value) || 0, credit_limit: Number(form.credit_limit) || 0, customer_id: form.customer_id || null, account_manager_id: form.account_manager_id || null, contract_start: form.contract_start || null, contract_end: form.contract_end || null, created_by: user?.id ?? null };
    const { error } = await supabase.from("commercial_accounts").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Account created"); setOpen(false); setForm(empty); load();
  };

  return (
    <>
      <PageHeader eyebrow="CRM" title="Commercial Accounts" description="B2B accounts with contracts, credit limits, and dedicated account managers."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-1.5 h-4 w-4" />New account</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New commercial account</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <F label="Account name" req cls="sm:col-span-2"><Input value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} placeholder="Acme Properties LLC" /></F>
                <F label="Linked customer"><Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></F>
                <F label="Industry"><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Real Estate, Retail, Healthcare" /></F>
                <F label="Account manager"><Select value={form.account_manager_id} onValueChange={(v) => setForm({ ...form, account_manager_id: v })}><SelectTrigger><SelectValue placeholder="Assign" /></SelectTrigger><SelectContent>{techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent></Select></F>
                <F label="Status"><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_"," ")}</SelectItem>)}</SelectContent></Select></F>
                <F label="Contract value"><Input type="number" step="0.01" value={form.contract_value} onChange={(e) => setForm({ ...form, contract_value: Number(e.target.value) })} /></F>
                <F label="Credit limit"><Input type="number" step="0.01" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: Number(e.target.value) })} /></F>
                <F label="Payment terms"><Input value={form.payment_terms} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} /></F>
                <F label="Primary contact"><Input value={form.primary_contact} onChange={(e) => setForm({ ...form, primary_contact: e.target.value })} /></F>
                <F label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></F>
                <F label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></F>
                <F label="Contract start"><Input type="date" value={form.contract_start} onChange={(e) => setForm({ ...form, contract_start: e.target.value })} /></F>
                <F label="Contract end"><Input type="date" value={form.contract_end} onChange={(e) => setForm({ ...form, contract_end: e.target.value })} /></F>
                <F label="Notes" cls="sm:col-span-2"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></F>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>{saving ? "Saving…" : "Save"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        } />
      <div className="space-y-4 p-4 md:p-6">
        <div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search accounts…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center"><Building2 className="h-10 w-10 text-muted-foreground" /><h3 className="mt-3 text-base font-semibold">No commercial accounts yet</h3><p className="mt-1 text-sm text-muted-foreground">Track your B2B portfolio with contracts and credit terms.</p></div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full text-sm"><thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3 text-left">Account</th><th className="px-4 py-3 text-left">Industry</th><th className="px-4 py-3 text-left">Manager</th><th className="px-4 py-3 text-right">Contract</th><th className="px-4 py-3 text-right">Credit</th><th className="px-4 py-3 text-left">Renewal</th><th className="px-4 py-3 text-left">Status</th></tr></thead><tbody>{filtered.map((r) => (<tr key={r.id} className="border-t border-border hover:bg-muted/20"><td className="px-4 py-3 font-medium">{r.account_name}<div className="text-xs text-muted-foreground">{cmap[r.customer_id] ?? ""}</div></td><td className="px-4 py-3 text-muted-foreground">{r.industry ?? "—"}</td><td className="px-4 py-3 text-muted-foreground">{tmap[r.account_manager_id] ?? "—"}</td><td className="px-4 py-3 text-right">${Number(r.contract_value ?? 0).toLocaleString()}</td><td className="px-4 py-3 text-right">${Number(r.credit_limit ?? 0).toLocaleString()}</td><td className="px-4 py-3 text-muted-foreground">{r.contract_end ?? "—"}</td><td className="px-4 py-3"><Badge variant="outline" className="capitalize">{r.status?.replace("_"," ")}</Badge></td></tr>))}</tbody></table></div>
        )}
      </div>
    </>
  );
}

function F({ label, req, cls, children }: { label: string; req?: boolean; cls?: string; children: React.ReactNode }) {
  return <div className={"space-y-1.5 " + (cls ?? "")}><Label>{label}{req ? <span className="text-destructive"> *</span> : null}</Label>{children}</div>;
}
