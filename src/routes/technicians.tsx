import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, HardHat, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Tech = {
  id: string; full_name: string; role_title: string | null; phone: string | null;
  email: string | null; skills: string[] | null; status: string; hourly_rate: number | null;
};

export const Route = createFileRoute("/technicians")({ component: TechniciansPage });

function TechniciansPage() {
  const qc = useQueryClient();
  const { companyId, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", role_title: "Service Tech", phone: "", email: "", skills: "", hourly_rate: "" });

  const q = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase.from("technicians").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Tech[];
    },
  });

  const create = async () => {
    if (!companyId) return toast.error("Workspace loading");
    if (!form.full_name.trim()) return toast.error("Name required");
    const { error } = await supabase.from("technicians").insert({
      company_id: companyId,
      full_name: form.full_name.trim(),
      role_title: form.role_title || null,
      phone: form.phone || null,
      email: form.email || null,
      skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
      created_by: user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    setOpen(false);
    setForm({ full_name: "", role_title: "Service Tech", phone: "", email: "", skills: "", hourly_rate: "" });
    toast.success("Technician added");
    qc.invalidateQueries({ queryKey: ["technicians"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this technician?")) return;
    const { error } = await supabase.from("technicians").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    qc.invalidateQueries({ queryKey: ["technicians"] });
  };

  const techs = q.data ?? [];

  return (
    <>
      <PageHeader title="Technicians" description="Field workforce, skills, and availability." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add technician</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New technician</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <Field label="Full name"><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Role"><Input value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} /></Field>
                <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                <Field label="Hourly rate"><Input type="number" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} /></Field>
              </div>
              <Field label="Skills (comma separated)"><Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Refrigeration, Install" /></Field>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create} style={{ backgroundImage: "var(--gradient-primary)" }}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="p-6">
        {q.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : techs.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <HardHat className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No technicians yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add your field team to start dispatching jobs.</p>
            <Button className="mt-4" size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add technician</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {techs.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground" style={{ backgroundImage: "var(--gradient-primary)" }}>
                        {t.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-semibold">{t.full_name}</p>
                        <p className="text-xs text-muted-foreground">{t.role_title ?? "Technician"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{t.status}</Badge>
                      <Button size="icon" variant="ghost" onClick={() => remove(t.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                    </div>
                  </div>
                  {t.phone && (<div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {t.phone}</div>)}
                  {t.skills && t.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {t.skills.map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
