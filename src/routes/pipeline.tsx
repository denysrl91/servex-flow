import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const STAGES = ["new_lead", "qualified", "proposal", "negotiation", "won", "lost"] as const;
type Stage = typeof STAGES[number];
const STAGE_LABEL: Record<Stage, string> = { new_lead: "New Lead", qualified: "Qualified", proposal: "Proposal", negotiation: "Negotiation", won: "Won", lost: "Lost" };

type Opp = { id: string; name: string; value: number; stage: Stage; customer_id: string | null; expected_close: string | null };

export const Route = createFileRoute("/pipeline")({ component: PipelinePage });

function PipelinePage() {
  const qc = useQueryClient();
  const { companyId, user } = useAuth();
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", value: "", stage: "new_lead" as Stage, customer_id: "", expected_close: "" });

  useEffect(() => { supabase.from("customers").select("id,name").order("name").then(({ data }) => setCustomers(data ?? [])); }, []);

  const q = useQuery({
    queryKey: ["sales_opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sales_opportunities").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Opp[];
    },
  });

  const create = async () => {
    if (!companyId) return toast.error("Workspace loading");
    if (!form.name.trim() || !Number(form.value)) return toast.error("Name and value required");
    const { error } = await supabase.from("sales_opportunities").insert({
      company_id: companyId, name: form.name.trim(), value: Number(form.value),
      stage: form.stage, customer_id: form.customer_id || null,
      expected_close: form.expected_close || null, created_by: user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    setOpen(false);
    setForm({ name: "", value: "", stage: "new_lead", customer_id: "", expected_close: "" });
    toast.success("Opportunity added");
    qc.invalidateQueries({ queryKey: ["sales_opportunities"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this opportunity?")) return;
    const { error } = await supabase.from("sales_opportunities").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["sales_opportunities"] });
  };

  const move = async (id: string, stage: Stage) => {
    const { error } = await supabase.from("sales_opportunities").update({ stage }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["sales_opportunities"] });
  };

  const opps = q.data ?? [];
  const byStage: Record<Stage, Opp[]> = Object.fromEntries(STAGES.map((s) => [s, [] as Opp[]])) as any;
  opps.forEach((o) => { (byStage[o.stage] ?? byStage.new_lead).push(o); });
  const cmap = Object.fromEntries(customers.map((c) => [c.id, c.name]));

  return (
    <>
      <PageHeader title="Sales Pipeline" description="Track opportunities from lead to close." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add deal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New opportunity</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <Field label="Deal name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Value ($)"><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field>
                <Field label="Stage">
                  <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as Stage })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABEL[s]}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Customer (optional)">
                <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Expected close"><Input type="date" value={form.expected_close} onChange={(e) => setForm({ ...form, expected_close: e.target.value })} /></Field>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create} style={{ backgroundImage: "var(--gradient-primary)" }}>Add</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="overflow-x-auto p-6">
        {opps.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No deals yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add your first opportunity to start tracking your pipeline.</p>
            <Button className="mt-4" size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add deal</Button>
          </div>
        ) : (
          <div className="flex min-w-max gap-4">
            {STAGES.map((stage) => {
              const items = byStage[stage];
              const total = items.reduce((s, d) => s + Number(d.value), 0);
              return (
                <div key={stage} className="w-72 shrink-0">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <h3 className="text-sm font-semibold">{STAGE_LABEL[stage]}</h3>
                    <span className="text-xs text-muted-foreground">{items.length} · ${total.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-2 min-h-24">
                    {items.map((d) => (
                      <Card key={d.id} className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{d.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">${Number(d.value).toLocaleString()}{d.customer_id ? ` · ${cmap[d.customer_id] ?? ""}` : ""}</p>
                          </div>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => remove(d.id)}><Trash2 className="h-3 w-3 text-muted-foreground" /></Button>
                        </div>
                        <Select value={d.stage} onValueChange={(v) => move(d.id, v as Stage)}>
                          <SelectTrigger className="mt-2 h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s} className="text-xs">{STAGE_LABEL[s]}</SelectItem>)}</SelectContent>
                        </Select>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
