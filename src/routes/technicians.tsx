import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { technicians as seed } from "@/lib/mock-data";
import { Plus, Phone } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/technicians")({ component: TechniciansPage });

function TechniciansPage() {
  const [techs, setTechs] = useState(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "Service Tech", phone: "", skills: "" });
  const invite = () => {
    if (!form.name) return toast.error("Name required");
    const id = `T-${100 + techs.length + 1}`;
    setTechs([{ id, name: form.name, role: form.role, phone: form.phone || "—", jobsToday: 0, utilization: 0, status: "Available", skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean) }, ...techs]);
    setForm({ name: "", role: "Service Tech", phone: "", skills: "" });
    setOpen(false);
    toast.success("Invitation sent");
  };
  return (
    <>
      <PageHeader title="Technicians" description="Field workforce, skills, and utilization." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Invite Tech</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite technician</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="space-y-1.5"><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Skills (comma separated)</Label><Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Refrigeration, Install" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={invite} style={{ backgroundImage: "var(--gradient-primary)" }}>Send invite</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
        {techs.map((t) => (
          <Card key={t.id} className="shadow-[var(--shadow-card)]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground" style={{ backgroundImage: "var(--gradient-primary)" }}>
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <Badge className={t.status === "Available" ? "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)] border-transparent" : "bg-primary/10 text-primary border-transparent"}>{t.status}</Badge>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" /> {t.phone}
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {t.skills.map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3 text-center">
                <div><p className="text-lg font-semibold">{t.jobsToday}</p><p className="text-xs text-muted-foreground">Jobs today</p></div>
                <div><p className="text-lg font-semibold">{t.utilization}%</p><p className="text-xs text-muted-foreground">Utilization</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}