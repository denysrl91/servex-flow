import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Wrench, Briefcase, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs")({ component: JobsPage });

type JobRow = {
  id: string;
  job_number: string;
  title: string;
  status: string;
  priority: string;
  scheduled_start: string | null;
  total_value: number;
};

function JobsPage() {
  const { companyId, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string; service_address: string | null }[]>([]);
  const [properties, setProperties] = useState<{ id: string; customer_id: string; name: string | null; address: string }[]>([]);
  const [technicians, setTechnicians] = useState<{ id: string; full_name: string }[]>([]);
  const [form, setForm] = useState({
    title: "Diagnostic service call",
    customer_id: "",
    new_customer: "",
    property_id: "",
    technician_id: "",
    scheduled_start: "",
    duration_minutes: "90",
    priority: "medium",
    status: "scheduled",
    service_address: "",
    total_value: "0",
    description: "",
  });
  const q = useQuery({
    queryKey: ["jobs-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id,job_number,title,status,priority,scheduled_start,total_value")
        .order("scheduled_start", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as JobRow[];
    },
  });

  const realRows = q.data ?? [];
  const filteredProperties = useMemo(
    () => properties.filter((p) => !form.customer_id || p.customer_id === form.customer_id),
    [properties, form.customer_id],
  );

  useEffect(() => {
    Promise.all([
      supabase.from("customers").select("id,name,service_address").order("name"),
      supabase.from("properties").select("id,customer_id,name,address").order("created_at", { ascending: false }),
      supabase.from("technicians").select("id,full_name").order("full_name"),
    ]).then(([c, p, t]) => {
      setCustomers((c.data ?? []) as typeof customers);
      setProperties((p.data ?? []) as typeof properties);
      setTechnicians((t.data ?? []) as typeof technicians);
    });
  }, []);

  const createJob = async () => {
    if (!companyId) return toast.error("Workspace is still loading. Refresh and try again.");
    if (!form.title.trim()) return toast.error("Job title required");
    setSaving(true);
    let customerId = form.customer_id;
    if (!customerId && form.new_customer.trim()) {
      const { data, error } = await supabase.from("customers").insert({
        company_id: companyId,
        name: form.new_customer.trim(),
        type: "residential",
        service_address: form.service_address || null,
        billing_address: form.service_address || null,
        created_by: user?.id ?? null,
      }).select("id,name,service_address").single();
      if (error || !data) { setSaving(false); return toast.error(error?.message ?? "Customer could not be created"); }
      customerId = data.id;
      setCustomers((prev) => [data as (typeof customers)[number], ...prev]);
    }
    if (!customerId) { setSaving(false); return toast.error("Select or add a customer"); }
    const selectedCustomer = customers.find((c) => c.id === customerId);
    const selectedProperty = properties.find((p) => p.id === form.property_id);
    const start = form.scheduled_start ? new Date(form.scheduled_start) : null;
    const duration = Number(form.duration_minutes) || 60;
    const { error } = await supabase.from("jobs").insert({
      company_id: companyId,
      job_number: `JOB-${Date.now().toString().slice(-6)}`,
      title: form.title.trim(),
      customer_id: customerId,
      property_id: form.property_id || null,
      technician_id: form.technician_id || null,
      description: form.description || null,
      scheduled_start: start?.toISOString() ?? null,
      scheduled_end: start ? new Date(start.getTime() + duration * 60000).toISOString() : null,
      duration_minutes: duration,
      priority: form.priority as "low" | "medium" | "high" | "urgent",
      status: form.status as "scheduled" | "dispatched" | "in_progress" | "completed" | "cancelled" | "unassigned",
      service_address: form.service_address || selectedProperty?.address || selectedCustomer?.service_address || null,
      total_value: Number(form.total_value) || 0,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    setOpen(false);
    toast.success("Job created");
    q.refetch();
  };

  return (
    <>
      <PageHeader title="Jobs" description="All work orders, past and upcoming." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New Job</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New job</DialogTitle><DialogDescription>Create a work order for dispatch, scheduling, and parts tracking.</DialogDescription></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Job title" required className="sm:col-span-2"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
              <Field label="Customer"><Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v, new_customer: "" })}><SelectTrigger><SelectValue placeholder="Select existing customer" /></SelectTrigger><SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Or new customer"><Input value={form.new_customer} onChange={(e) => setForm({ ...form, new_customer: e.target.value, customer_id: "" })} placeholder="Customer name" /></Field>
              <Field label="Property"><Select value={form.property_id} onValueChange={(v) => setForm({ ...form, property_id: v })}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{filteredProperties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name ?? p.address}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Technician"><Select value={form.technician_id} onValueChange={(v) => setForm({ ...form, technician_id: v })}><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger><SelectContent>{technicians.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Scheduled"><Input type="datetime-local" value={form.scheduled_start} onChange={(e) => setForm({ ...form, scheduled_start: e.target.value })} /></Field>
              <Field label="Duration minutes"><Input type="number" min="15" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} /></Field>
              <Field label="Priority"><Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["low", "medium", "high", "urgent"].map((v) => <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Estimated value"><Input type="number" min="0" step="0.01" value={form.total_value} onChange={(e) => setForm({ ...form, total_value: e.target.value })} /></Field>
              <Field label="Service address" className="sm:col-span-2"><Input value={form.service_address} onChange={(e) => setForm({ ...form, service_address: e.target.value })} placeholder="Optional if property has an address" /></Field>
              <Field label="Description" className="sm:col-span-2"><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={createJob} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>{saving ? "Creating…" : "Create job"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="p-6">
        {q.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : realRows.length > 0 ? (
          <DataTable
            rows={realRows}
            columns={[
              { key: "job_number", header: "Job" },
              { key: "title", header: "Description", render: (r) => <span className="font-medium">{r.title}</span> },
              { key: "scheduled_start", header: "Scheduled", render: (r) => r.scheduled_start ? new Date(r.scheduled_start).toLocaleString() : "—" },
              { key: "priority", header: "Priority", render: (r) => <Badge variant="outline">{r.priority}</Badge> },
              { key: "status", header: "Status", render: (r) => <Badge className="bg-primary/10 text-primary border-transparent">{r.status}</Badge> },
              { key: "total_value", header: "Value", className: "text-right", render: (r) => <span className="font-medium">${Number(r.total_value).toFixed(0)}</span> },
              { key: "actions", header: "", render: (r) => (
                <div className="flex items-center justify-end gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/jobs/$jobId/parts" params={{ jobId: r.id }}><Wrench className="mr-2 h-3.5 w-3.5" /> Parts</Link>
                  </Button>
                  <Button size="icon" variant="ghost" onClick={async () => {
                    if (!confirm("Delete this job?")) return;
                    const { error } = await supabase.from("jobs").delete().eq("id", r.id);
                    if (error) return toast.error(error.message);
                    toast.success("Job deleted");
                    q.refetch();
                  }}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                </div>
              ) },
            ]}
          />
        ) : (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No jobs yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first work order to start dispatching.</p>
            <Button className="mt-4" size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> New job</Button>
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