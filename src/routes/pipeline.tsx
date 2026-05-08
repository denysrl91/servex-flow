import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { pipeline as seed } from "@/lib/mock-data";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/pipeline")({ component: PipelinePage });

function PipelinePage() {
  const [stages, setStages] = useState(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", value: "", stage: seed[0]?.stage ?? "New Lead" });
  const create = () => {
    const v = Number(form.value);
    if (!form.name || !v) return toast.error("Name and value required");
    const id = `D-${Date.now()}`;
    setStages(stages.map((s) => s.stage === form.stage ? { ...s, deals: [{ id, name: form.name, value: v }, ...s.deals] } : s));
    setForm({ name: "", value: "", stage: form.stage });
    setOpen(false);
    toast.success("Deal added");
  };
  return (
    <>
      <PageHeader title="Sales Pipeline" description="Track opportunities from lead to close." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add Deal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add deal</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="space-y-1.5"><Label>Deal name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Value ($)</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Stage</Label>
                  <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{stages.map((s) => <SelectItem key={s.stage} value={s.stage}>{s.stage}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create} style={{ backgroundImage: "var(--gradient-primary)" }}>Add</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="overflow-x-auto p-6">
        <div className="flex min-w-max gap-4">
          {stages.map((col) => {
            const total = col.deals.reduce((s, d) => s + d.value, 0);
            return (
              <div key={col.stage} className="w-72 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold">{col.stage}</h3>
                  <span className="text-xs text-muted-foreground">{col.deals.length} · ${total.toLocaleString()}</span>
                </div>
                <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-2">
                  {col.deals.map((d) => (
                    <Card key={d.id} className="cursor-grab p-3 shadow-[var(--shadow-card)] hover:shadow-md">
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">${d.value.toLocaleString()}</p>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}