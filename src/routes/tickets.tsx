import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, LifeBuoy, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Ticket = {
  id: string; ticket_number: string; subject: string; description: string | null;
  customer_id: string; assigned_to: string | null; priority: string; status: string; created_at: string;
};

export const Route = createFileRoute("/tickets")({ component: TicketsPage });

function TicketsPage() {
  const qc = useQueryClient();
  const { companyId, user } = useAuth();
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [techs, setTechs] = useState<{ id: string; full_name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", customer_id: "", assigned_to: "", priority: "medium", status: "open" });

  useEffect(() => {
    Promise.all([
      supabase.from("customers").select("id,name").order("name"),
      supabase.from("technicians").select("id,full_name").order("full_name"),
    ]).then(([c, t]) => {
      setCustomers(c.data ?? []);
      setTechs(t.data ?? []);
    });
  }, []);

  const q = useQuery({
    queryKey: ["service_tickets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_tickets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Ticket[];
    },
  });

  const create = async () => {
    if (!companyId) return toast.error("Workspace loading");
    if (!form.subject.trim() || !form.customer_id) return toast.error("Subject and customer required");
    const { error } = await supabase.from("service_tickets").insert({
      company_id: companyId,
      ticket_number: `TK-${Date.now().toString().slice(-6)}`,
      subject: form.subject.trim(),
      description: form.description || null,
      customer_id: form.customer_id,
      assigned_to: form.assigned_to || null,
      priority: form.priority as any,
      status: form.status as any,
      created_by: user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    setOpen(false);
    setForm({ subject: "", description: "", customer_id: "", assigned_to: "", priority: "medium", status: "open" });
    toast.success("Ticket created");
    qc.invalidateQueries({ queryKey: ["service_tickets"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this ticket?")) return;
    const { error } = await supabase.from("service_tickets").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["service_tickets"] });
  };

  const cmap = Object.fromEntries(customers.map((c) => [c.id, c.name]));
  const tmap = Object.fromEntries(techs.map((t) => [t.id, t.full_name]));
  const rows = q.data ?? [];

  return (
    <>
      <PageHeader title="Service Tickets" description="Inbound customer service requests." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New ticket</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New ticket</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <Field label="Subject"><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
              <Field label="Customer">
                <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Assigned to">
                <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>{techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Priority">
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["low","medium","high","urgent"].map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["open","in_progress","resolved","closed"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Description"><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create} style={{ backgroundImage: "var(--gradient-primary)" }}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="p-6">
        {q.isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : rows.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <LifeBuoy className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No tickets yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Track customer issues from intake to resolution.</p>
            <Button className="mt-4" size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> New ticket</Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Ticket</th><th className="px-4 py-3 text-left">Subject</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-left">Assigned</th><th className="px-4 py-3 text-left">Priority</th><th className="px-4 py-3 text-left">Status</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-t border-border/60 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{t.ticket_number}</td>
                    <td className="px-4 py-3">{t.subject}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cmap[t.customer_id] ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.assigned_to ? tmap[t.assigned_to] ?? "—" : "Unassigned"}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{t.priority}</Badge></td>
                    <td className="px-4 py-3"><Badge className="border-transparent bg-primary/10 capitalize text-primary">{t.status.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3 text-right"><Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button></td>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
