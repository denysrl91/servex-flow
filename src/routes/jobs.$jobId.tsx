import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { JOB_STATUSES, STATUS_LABEL } from "@/lib/dispatch-api";

export const Route = createFileRoute("/jobs/$jobId")({ component: JobDetailPage });

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [techs, setTechs] = useState<{ id: string; full_name: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [properties, setProperties] = useState<{ id: string; customer_id: string; name: string | null; address: string }[]>([]);

  const q = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).single();
      if (error) throw error;
      return data as Record<string, unknown>;
    },
  });

  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    if (q.data) {
      const j = q.data as Record<string, unknown>;
      const start = j.scheduled_start as string | null;
      setForm({
        title: String(j.title ?? ""),
        description: String(j.description ?? ""),
        customer_id: String(j.customer_id ?? ""),
        property_id: String(j.property_id ?? ""),
        technician_id: String(j.technician_id ?? ""),
        priority: String(j.priority ?? "medium"),
        status: String(j.status ?? "scheduled"),
        scheduled_start: start ? new Date(start).toISOString().slice(0, 16) : "",
        duration_minutes: String(j.duration_minutes ?? 60),
        service_address: String(j.service_address ?? ""),
        total_value: String(j.total_value ?? 0),
      });
    }
  }, [q.data]);

  useEffect(() => {
    Promise.all([
      supabase.from("technicians").select("id,full_name").order("full_name"),
      supabase.from("customers").select("id,name").order("name"),
      supabase.from("properties").select("id,customer_id,name,address"),
    ]).then(([t, c, p]) => {
      setTechs((t.data ?? []) as typeof techs);
      setCustomers((c.data ?? []) as typeof customers);
      setProperties((p.data ?? []) as typeof properties);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const start = form.scheduled_start ? new Date(form.scheduled_start) : null;
    const dur = Number(form.duration_minutes) || 60;
    const { error } = await supabase.from("jobs").update({
      title: form.title.trim(),
      description: form.description || null,
      customer_id: form.customer_id || null,
      property_id: form.property_id || null,
      technician_id: form.technician_id || null,
      priority: form.priority as "low" | "medium" | "high" | "urgent",
      status: form.status as "scheduled" | "dispatched" | "in_progress" | "completed" | "cancelled" | "unassigned" | "on_the_way" | "arrived" | "invoiced" | "paid",
      scheduled_start: start?.toISOString() ?? null,
      scheduled_end: start ? new Date(start.getTime() + dur * 60000).toISOString() : null,
      duration_minutes: dur,
      service_address: form.service_address || null,
      total_value: Number(form.total_value) || 0,
    }).eq("id", jobId);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Job saved");
    qc.invalidateQueries({ queryKey: ["jobs"] });
    qc.invalidateQueries({ queryKey: ["jobs-list"] });
    qc.invalidateQueries({ queryKey: ["job", jobId] });
  };

  const cancelJob = async () => {
    const { error } = await supabase.from("jobs").update({ status: "cancelled" }).eq("id", jobId);
    if (error) return toast.error(error.message);
    toast.success("Job cancelled");
    qc.invalidateQueries({ queryKey: ["jobs"] });
    qc.invalidateQueries({ queryKey: ["jobs-list"] });
    setForm((f) => ({ ...f, status: "cancelled" }));
  };

  const remove = async () => {
    if (!confirm("Permanently delete this job?")) return;
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);
    if (error) return toast.error(error.message);
    toast.success("Job deleted");
    qc.invalidateQueries({ queryKey: ["jobs"] });
    qc.invalidateQueries({ queryKey: ["jobs-list"] });
    navigate({ to: "/jobs" });
  };

  if (q.isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading job…</div>;
  if (q.error) return <div className="p-6 text-sm text-destructive">{(q.error as Error).message}</div>;

  const filteredProps = properties.filter((p) => !form.customer_id || p.customer_id === form.customer_id);
  const job = q.data as Record<string, unknown>;

  return (
    <>
      <PageHeader
        title={`Job ${String(job.job_number ?? "")}`}
        description={form.title}
        actions={
          <>
            <Button asChild variant="outline" size="sm"><Link to="/jobs"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/jobs/$jobId/parts" params={{ jobId }}><Wrench className="mr-2 h-4 w-4" />Parts</Link></Button>
            <Button variant="outline" size="sm" onClick={cancelJob}>Cancel job</Button>
            <Button variant="outline" size="sm" onClick={remove}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
            <Button size="sm" onClick={save} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>
              <Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save"}
            </Button>
          </>
        }
      />
      <div className="p-6">
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2"><Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Customer">
              <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v, property_id: "" })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Property">
              <Select value={form.property_id || "none"} onValueChange={(v) => setForm({ ...form, property_id: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {filteredProps.map((p) => <SelectItem key={p.id} value={p.id}>{p.name ?? p.address}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Technician">
              <Select value={form.technician_id || "none"} onValueChange={(v) => setForm({ ...form, technician_id: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {techs.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No technicians yet. Add a technician first.</div>}
                  {techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{JOB_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Scheduled start"><Input type="datetime-local" value={form.scheduled_start ?? ""} onChange={(e) => setForm({ ...form, scheduled_start: e.target.value })} /></Field>
            <Field label="Duration (minutes)"><Input type="number" min="15" value={form.duration_minutes ?? "60"} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} /></Field>
            <Field label="Estimated value"><Input type="number" min="0" step="0.01" value={form.total_value ?? "0"} onChange={(e) => setForm({ ...form, total_value: e.target.value })} /></Field>
            <Field label="Service address" className="sm:col-span-2"><Input value={form.service_address ?? ""} onChange={(e) => setForm({ ...form, service_address: e.target.value })} /></Field>
            <Field label="Description" className="sm:col-span-2"><Textarea rows={4} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div className="sm:col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">{STATUS_LABEL[form.status as keyof typeof STATUS_LABEL] ?? form.status}</Badge>
              <span>Last updated {job.updated_at ? new Date(String(job.updated_at)).toLocaleString() : "—"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}