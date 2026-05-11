import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, Building2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Customer = {
  id: string; name: string; type: "residential" | "commercial"; contact_name: string | null;
  email: string | null; phone: string | null; billing_address: string | null;
  service_address: string | null; notes: string | null; tags: string[];
  lifetime_value: number; status: "active" | "inactive" | "prospect";
};

export const Route = createFileRoute("/customers")({ component: CustomersPage });

function CustomersPage() {
  const { companyId, user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "residential", contact_name: "", email: "", phone: "", billing_address: "", service_address: "", tags: "", notes: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as Customer[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [r.name, r.contact_name, r.email, r.phone, r.billing_address].some((v) => v?.toLowerCase().includes(s)));
  }, [rows, q]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.name.trim()) return toast.error("Name required");
    const { data, error } = await supabase.from("customers").insert({
      company_id: companyId,
      name: form.name.trim(),
      type: form.type as "residential" | "commercial",
      contact_name: form.contact_name || null,
      email: form.email || null,
      phone: form.phone || null,
      billing_address: form.billing_address || null,
      service_address: form.service_address || form.billing_address || null,
      notes: form.notes || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      created_by: user?.id ?? null,
    }).select("id").single();
    if (error || !data) return toast.error(error?.message ?? "Failed");
    setOpen(false);
    toast.success("Customer added");
    navigate({ to: "/customers/$customerId", params: { customerId: data.id } });
  };

  const remove = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete customer "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Customer deleted");
    setRows((r) => r.filter((c) => c.id !== id));
  };

  return (
    <>
      <PageHeader
        title="Customers"
        description="Residential & commercial accounts — full HVAC history at a glance."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add customer</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>New customer</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" required className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <Field label="Type"><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="residential">Residential</SelectItem><SelectItem value="commercial">Commercial</SelectItem></SelectContent></Select></Field>
                <Field label="Primary contact"><Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></Field>
                <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
                <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                <Field label="Billing address" className="sm:col-span-2"><Input value={form.billing_address} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} /></Field>
                <Field label="Service address" className="sm:col-span-2"><Input placeholder="Defaults to billing" value={form.service_address} onChange={(e) => setForm({ ...form, service_address: e.target.value })} /></Field>
                <Field label="Tags (comma separated)" className="sm:col-span-2"><Input placeholder="VIP, Maintenance Plan" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
                <Field label="Notes" className="sm:col-span-2"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create} style={{ backgroundImage: "var(--gradient-primary)" }}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="space-y-4 p-4 md:p-6">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, email, phone, address…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No customers yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add your first account to start tracking jobs, invoices, and equipment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Tags</th>
                  <th className="px-4 py-3 text-right">Lifetime value</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="cursor-pointer border-t border-border hover:bg-muted/30" onClick={() => navigate({ to: "/customers/$customerId", params: { customerId: c.id } })}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {c.type === "commercial" ? <Building2 className="h-4 w-4" /> : c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link to="/customers/$customerId" params={{ customerId: c.id }} className="font-medium hover:underline">{c.name}</Link>
                          {c.billing_address && <p className="text-xs text-muted-foreground">{c.billing_address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{c.type}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{c.contact_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{c.tags?.slice(0, 3).map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div></td>
                    <td className="px-4 py-3 text-right font-medium">${Number(c.lifetime_value ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" onClick={(e) => remove(e, c.id, c.name)} aria-label="Delete"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                    </td>
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
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label>{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}