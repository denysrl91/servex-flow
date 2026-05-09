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
import { Plus, MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/communications")({ component: CommsPage });

const CHANNELS = ["call", "email", "sms", "note"];
const DIRECTIONS = ["inbound", "outbound"];
const STATUSES = ["logged", "sent", "delivered", "follow_up"];

function CommsPage() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customer_id: "", channel: "note", direction: "outbound", subject: "", body: "", status: "logged" });

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: c }] = await Promise.all([
      supabase.from("customer_communications").select("*").order("created_at", { ascending: false }),
      supabase.from("customers").select("id,name").order("name"),
    ]);
    setRows(r ?? []); setCustomers(c ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const cmap = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c.name])), [customers]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [cmap[r.customer_id], r.channel, r.subject, r.body, r.status].filter(Boolean).join(" ").toLowerCase().includes(s)
    );
  }, [rows, q, cmap]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.customer_id) return toast.error("Customer required");
    setSaving(true);
    const { error } = await supabase.from("customer_communications").insert({
      company_id: companyId,
      customer_id: form.customer_id,
      channel: form.channel,
      direction: form.direction,
      subject: form.subject || null,
      body: form.body || null,
      status: form.status,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Communication logged");
    setOpen(false);
    setForm({ ...form, customer_id: "", subject: "", body: "" });
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="CRM"
        title="Communications"
        description="Calls, emails, SMS and notes — every customer touchpoint in one place."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
                <Plus className="mr-1.5 h-4 w-4" /> Log communication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>Log a communication</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Customer" required className="sm:col-span-2">
                  <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Channel">
                  <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CHANNELS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Direction">
                  <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DIRECTIONS.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Subject" className="sm:col-span-2"><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
                <Field label="Body" className="sm:col-span-2"><Textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
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
      <div className="space-y-4 p-6">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search communications…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No communications yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Log a call, email, SMS or internal note.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">When</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Channel</th>
                  <th className="px-4 py-3 text-left">Direction</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">{cmap[r.customer_id] ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{r.channel}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{r.direction}</td>
                    <td className="px-4 py-3">{r.subject ?? <span className="text-muted-foreground">—</span>}</td>
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
