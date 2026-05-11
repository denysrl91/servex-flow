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
import { Plus, Clock, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/time-tracking")({ component: Page });

const STATUSES = ["pending", "approved", "rejected", "paid"] as const;
const TYPES = ["regular", "overtime", "holiday", "pto", "sick", "travel"] as const;

function Page() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    technician_id: "", job_id: "", entry_date: new Date().toISOString().slice(0, 10),
    clock_in: "", clock_out: "", hours: 0, entry_type: "regular",
    billable: true, status: "pending", notes: "",
  });

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: t }, { data: j }] = await Promise.all([
      supabase.from("time_entries").select("*").order("entry_date", { ascending: false }),
      supabase.from("technicians").select("id,full_name").order("full_name"),
      supabase.from("jobs").select("id,job_number,title").order("created_at", { ascending: false }).limit(200),
    ]);
    setRows(r ?? []); setTechs(t ?? []); setJobs(j ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const tmap = useMemo(() => Object.fromEntries(techs.map((t) => [t.id, t.full_name])), [techs]);
  const jmap = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, `${j.job_number} · ${j.title}`])), [jobs]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [tmap[r.technician_id], jmap[r.job_id], r.entry_type, r.status].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [rows, q, tmap, jmap]);

  const totalHours = useMemo(() => filtered.reduce((s, r) => s + Number(r.hours ?? 0), 0), [filtered]);

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.technician_id) return toast.error("Technician required");
    setSaving(true);
    const { error } = await supabase.from("time_entries").insert({
      company_id: companyId,
      technician_id: form.technician_id,
      job_id: form.job_id || null,
      entry_date: form.entry_date,
      clock_in: form.clock_in ? new Date(`${form.entry_date}T${form.clock_in}`).toISOString() : null,
      clock_out: form.clock_out ? new Date(`${form.entry_date}T${form.clock_out}`).toISOString() : null,
      hours: Number(form.hours) || 0,
      entry_type: form.entry_type,
      billable: form.billable,
      status: form.status,
      notes: form.notes || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Time entry logged");
    setOpen(false);
    setForm({ technician_id: "", job_id: "", entry_date: new Date().toISOString().slice(0, 10), clock_in: "", clock_out: "", hours: 0, entry_type: "regular", billable: true, status: "pending", notes: "" });
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Workforce"
        title="Time Tracking"
        description="Mobile clock-in/out, job-level time, and timesheet approvals."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-1.5 h-4 w-4" /> New entry</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New time entry</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Technician" required>
                  <Select value={form.technician_id} onValueChange={(v) => setForm({ ...form, technician_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select tech" /></SelectTrigger>
                    <SelectContent>{techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Job">
                  <Select value={form.job_id} onValueChange={(v) => setForm({ ...form, job_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>{jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.job_number} · {j.title}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Date"><Input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} /></Field>
                <Field label="Hours"><Input type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} /></Field>
                <Field label="Clock in"><Input type="time" value={form.clock_in} onChange={(e) => setForm({ ...form, clock_in: e.target.value })} /></Field>
                <Field label="Clock out"><Input type="time" value={form.clock_out} onChange={(e) => setForm({ ...form, clock_out: e.target.value })} /></Field>
                <Field label="Type">
                  <Select value={form.entry_type} onValueChange={(v) => setForm({ ...form, entry_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Billable">
                  <Select value={form.billable ? "yes" : "no"} onValueChange={(v) => setForm({ ...form, billable: v === "yes" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="yes">Billable</SelectItem><SelectItem value="no">Non-billable</SelectItem></SelectContent>
                  </Select>
                </Field>
                <Field label="Notes" className="sm:col-span-2"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>{saving ? "Saving…" : "Save"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search timesheets…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="text-sm text-muted-foreground">Total: <span className="font-semibold text-foreground">{totalHours.toFixed(2)} hrs</span></div>
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Clock className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No time entries yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Log time against jobs to track labor and prepare payroll.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr>
                <th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Technician</th>
                <th className="px-4 py-3 text-left">Job</th><th className="px-4 py-3 text-right">Hours</th>
                <th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Billable</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr></thead>
              <tbody>{filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground">{r.entry_date}</td>
                  <td className="px-4 py-3 font-medium">{tmap[r.technician_id] ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.job_id ? (jmap[r.job_id] ?? "—") : "—"}</td>
                  <td className="px-4 py-3 text-right font-medium">{Number(r.hours ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{r.entry_type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.billable ? "Yes" : "No"}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{r.status}</Badge></td>
                </tr>
              ))}</tbody>
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
      <Label>{label}{required ? <span className="text-destructive"> *</span> : null}</Label>
      {children}
    </div>
  );
}
