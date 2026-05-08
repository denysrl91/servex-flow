import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, MapPin, Plus, Image as ImageIcon, Trash2, MessageSquare, FileText, Receipt, Wrench, Ticket, ShieldCheck, StickyNote, Tag } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

export const Route = createFileRoute("/customers/$customerId")({ component: CustomerProfile });

type Customer = {
  id: string; name: string; type: "residential" | "commercial"; contact_name: string | null;
  email: string | null; phone: string | null; billing_address: string | null;
  service_address: string | null; notes: string | null; tags: string[];
  lifetime_value: number; status: string;
};

function CustomerProfile() {
  const { customerId } = Route.useParams();
  const { companyId, user } = useAuth();
  const [c, setC] = useState<Customer | null>(null);
  const [props, setProps] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [comms, setComms] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);

  const reload = async () => {
    const [cr, pr, er, jr, esr, ir, tr, ar, cmr, phr] = await Promise.all([
      supabase.from("customers").select("*").eq("id", customerId).maybeSingle(),
      supabase.from("properties").select("*").eq("customer_id", customerId).order("created_at", { ascending: false }),
      supabase.from("equipment").select("*").eq("customer_id", customerId).order("created_at", { ascending: false }),
      supabase.from("jobs").select("id,job_number,title,status,scheduled_start,total_value").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(50),
      supabase.from("estimates").select("id,estimate_number,title,status,total,created_at").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(50),
      supabase.from("invoices").select("id,invoice_number,total,balance_due,status,issued_at").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(50),
      supabase.from("service_tickets").select("id,ticket_number,subject,status,priority,created_at").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(50),
      supabase.from("maintenance_agreements").select("id,name,status,frequency,annual_price,next_visit").eq("customer_id", customerId).order("created_at", { ascending: false }),
      supabase.from("customer_communications").select("*").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(100),
      supabase.from("customer_photos").select("*").eq("customer_id", customerId).order("created_at", { ascending: false }),
    ]);
    setC(cr.data as Customer | null);
    setProps(pr.data ?? []);
    setEquipment(er.data ?? []);
    setJobs(jr.data ?? []);
    setEstimates(esr.data ?? []);
    setInvoices(ir.data ?? []);
    setTickets(tr.data ?? []);
    setAgreements(ar.data ?? []);
    setComms(cmr.data ?? []);
    setPhotos(phr.data ?? []);
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [customerId]);

  const save = async (patch: CustomerUpdate) => {
    if (!c) return;
    setC({ ...c, ...(patch as Partial<Customer>) });
    await supabase.from("customers").update(patch).eq("id", c.id);
  };

  const addComm = async (form: { channel: string; direction: string; subject: string; body: string }) => {
    if (!companyId || !c) return;
    const { error } = await supabase.from("customer_communications").insert({
      company_id: companyId, customer_id: c.id, channel: form.channel, direction: form.direction,
      subject: form.subject || null, body: form.body || null, created_by: user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    toast.success("Logged");
    reload();
  };

  const addPhoto = async () => {
    const url = window.prompt("Image URL");
    if (!url || !companyId || !c) return;
    const caption = window.prompt("Caption (optional)") ?? null;
    await supabase.from("customer_photos").insert({ company_id: companyId, customer_id: c.id, url, caption, created_by: user?.id ?? null });
    reload();
  };

  const removePhoto = async (id: string) => { await supabase.from("customer_photos").delete().eq("id", id); reload(); };

  if (!c) return <div className="p-8 text-sm text-muted-foreground">Loading customer…</div>;

  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const balance = invoices.reduce((s, i) => s + Number(i.balance_due ?? 0), 0);
  const openTickets = tickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length;

  return (
    <>
      <PageHeader
        title={c.name}
        description={`${c.type === "commercial" ? "Commercial" : "Residential"} • ${c.contact_name ?? "—"}`}
        actions={
          <Link to="/customers"><Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> All customers</Button></Link>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-[320px_1fr]">
        {/* Left rail */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">{c.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <Badge variant="outline" className="mt-0.5 capitalize">{c.type}</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {c.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a></div>}
                {c.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a></div>}
                {c.billing_address && <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /> <span>{c.billing_address}</span></div>}
              </div>
              <div className="flex flex-wrap gap-1 pt-2">
                {(c.tags ?? []).map((t) => <Badge key={t} variant="secondary" className="text-[10px]"><Tag className="mr-1 h-2.5 w-2.5" />{t}</Badge>)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">At a glance</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="Lifetime" value={`$${Number(c.lifetime_value).toLocaleString()}`} />
              <Stat label="Invoiced" value={`$${totalInvoiced.toLocaleString()}`} />
              <Stat label="Balance" value={`$${balance.toLocaleString()}`} tone={balance > 0 ? "warn" : undefined} />
              <Stat label="Open tickets" value={openTickets.toString()} tone={openTickets > 0 ? "warn" : undefined} />
              <Stat label="Properties" value={props.length.toString()} />
              <Stat label="Equipment" value={equipment.length.toString()} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Edit profile</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <FieldX label="Primary contact"><Input value={c.contact_name ?? ""} onChange={(e) => setC({ ...c, contact_name: e.target.value })} onBlur={(e) => save({ contact_name: e.target.value })} /></FieldX>
              <FieldX label="Phone"><Input value={c.phone ?? ""} onChange={(e) => setC({ ...c, phone: e.target.value })} onBlur={(e) => save({ phone: e.target.value })} /></FieldX>
              <FieldX label="Email"><Input value={c.email ?? ""} onChange={(e) => setC({ ...c, email: e.target.value })} onBlur={(e) => save({ email: e.target.value })} /></FieldX>
              <FieldX label="Billing address"><Input value={c.billing_address ?? ""} onChange={(e) => setC({ ...c, billing_address: e.target.value })} onBlur={(e) => save({ billing_address: e.target.value })} /></FieldX>
              <FieldX label="Service address"><Input value={c.service_address ?? ""} onChange={(e) => setC({ ...c, service_address: e.target.value })} onBlur={(e) => save({ service_address: e.target.value })} /></FieldX>
              <FieldX label="Tags (comma separated)">
                <Input value={(c.tags ?? []).join(", ")} onChange={(e) => setC({ ...c, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} onBlur={(e) => save({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
              </FieldX>
              <FieldX label="Notes"><Textarea rows={3} value={c.notes ?? ""} onChange={(e) => setC({ ...c, notes: e.target.value })} onBlur={(e) => save({ notes: e.target.value })} /></FieldX>
            </CardContent>
          </Card>
        </aside>

        {/* Tabs */}
        <main>
          <Tabs defaultValue="activity">
            <TabsList className="flex w-full flex-wrap justify-start">
              <TabsTrigger value="activity"><MessageSquare className="mr-1.5 h-3.5 w-3.5" />Activity</TabsTrigger>
              <TabsTrigger value="properties"><MapPin className="mr-1.5 h-3.5 w-3.5" />Properties{props.length > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">{props.length}</Badge>}</TabsTrigger>
              <TabsTrigger value="equipment"><Wrench className="mr-1.5 h-3.5 w-3.5" />Equipment{equipment.length > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">{equipment.length}</Badge>}</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="estimates"><FileText className="mr-1.5 h-3.5 w-3.5" />Estimates</TabsTrigger>
              <TabsTrigger value="invoices"><Receipt className="mr-1.5 h-3.5 w-3.5" />Invoices</TabsTrigger>
              <TabsTrigger value="tickets"><Ticket className="mr-1.5 h-3.5 w-3.5" />Tickets</TabsTrigger>
              <TabsTrigger value="agreements"><ShieldCheck className="mr-1.5 h-3.5 w-3.5" />Agreements</TabsTrigger>
              <TabsTrigger value="photos"><ImageIcon className="mr-1.5 h-3.5 w-3.5" />Photos</TabsTrigger>
              <TabsTrigger value="notes"><StickyNote className="mr-1.5 h-3.5 w-3.5" />Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <CommunicationLog comms={comms} onLog={addComm} />
            </TabsContent>

            <TabsContent value="properties" className="mt-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{props.length} {props.length === 1 ? "property" : "properties"} linked to this customer</div>
                <AddPropertyDialog customerId={c.id} companyId={companyId} userId={user?.id ?? null} defaultAddress={c.service_address ?? ""} onAdded={reload} />
              </div>
              <SimpleList
                empty="No properties linked yet."
                rows={props}
                render={(p) => (
                  <Link key={p.id} to="/properties/$propertyId" params={{ propertyId: p.id }} className="flex items-center justify-between rounded-md border border-border bg-card p-3 hover:bg-muted/40">
                    <div>
                      <div className="font-medium">{p.name ?? p.address}</div>
                      <div className="text-xs text-muted-foreground">{p.address} • {p.type?.replace("_", " ")} • {p.system_count ?? 1} system(s)</div>
                    </div>
                    <Badge variant="outline" className="capitalize">{p.type?.replace("_", " ")}</Badge>
                  </Link>
                )}
              />
            </TabsContent>

            <TabsContent value="equipment" className="mt-4">
              <SimpleList
                empty="No equipment on file."
                rows={equipment}
                render={(e) => (
                  <Link key={e.id} to="/equipment/$equipmentId" params={{ equipmentId: e.id }} className="flex items-center justify-between rounded-md border border-border bg-card p-3 hover:bg-muted/40">
                    <div>
                      <div className="font-medium">{e.brand ?? "—"} {e.model ?? ""}</div>
                      <div className="text-xs text-muted-foreground">{e.type} {e.serial_number ? `• S/N ${e.serial_number}` : ""}</div>
                    </div>
                    <Badge variant="outline" className="capitalize">{e.status}</Badge>
                  </Link>
                )}
              />
            </TabsContent>

            <TabsContent value="jobs" className="mt-4">
              <SimpleTable empty="No jobs yet." cols={["Job #", "Title", "Status", "Scheduled", "Value"]} rows={jobs.map((j) => [j.job_number, j.title, j.status, j.scheduled_start?.slice(0, 10) ?? "—", `$${Number(j.total_value ?? 0).toLocaleString()}`])} />
            </TabsContent>

            <TabsContent value="estimates" className="mt-4">
              <SimpleTable empty="No estimates yet." cols={["Estimate", "Title", "Total", "Status", ""]} rows={estimates.map((e) => [e.estimate_number, e.title, `$${Number(e.total).toLocaleString()}`, e.status, <Link key={e.id} to="/estimates/$estimateId" params={{ estimateId: e.id }} className="text-primary hover:underline">Open →</Link>])} />
            </TabsContent>

            <TabsContent value="invoices" className="mt-4">
              <SimpleTable empty="No invoices yet." cols={["Invoice", "Issued", "Total", "Balance", "Status"]} rows={invoices.map((i) => [i.invoice_number, i.issued_at, `$${Number(i.total).toLocaleString()}`, `$${Number(i.balance_due).toLocaleString()}`, i.status])} />
            </TabsContent>

            <TabsContent value="tickets" className="mt-4">
              <SimpleTable empty="No service tickets." cols={["Ticket", "Subject", "Priority", "Status", "Opened"]} rows={tickets.map((t) => [t.ticket_number, t.subject, t.priority, t.status, t.created_at?.slice(0, 10)])} />
            </TabsContent>

            <TabsContent value="agreements" className="mt-4">
              <SimpleTable empty="No maintenance agreements." cols={["Plan", "Frequency", "Annual price", "Next visit", "Status"]} rows={agreements.map((a) => [a.name, a.frequency, `$${Number(a.annual_price).toLocaleString()}`, a.next_visit ?? "—", a.status])} />
            </TabsContent>

            <TabsContent value="photos" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Photos</CardTitle>
                  <Button size="sm" variant="outline" onClick={addPhoto}><Plus className="mr-2 h-4 w-4" /> Add photo URL</Button>
                </CardHeader>
                <CardContent>
                  {photos.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No photos yet.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {photos.map((p) => (
                        <div key={p.id} className="group relative overflow-hidden rounded-md border border-border">
                          <img src={p.url} alt={p.caption ?? ""} className="aspect-square w-full object-cover" />
                          <button onClick={() => removePhoto(p.id)} className="absolute right-1 top-1 rounded bg-background/80 p-1 opacity-0 transition group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                          {p.caption && <div className="truncate bg-card px-2 py-1 text-[11px]">{p.caption}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Internal notes</CardTitle></CardHeader>
                <CardContent>
                  <Textarea rows={6} value={c.notes ?? ""} onChange={(e) => setC({ ...c, notes: e.target.value })} onBlur={(e) => save({ notes: e.target.value })} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-semibold ${tone === "warn" ? "text-destructive" : ""}`}>{value}</div>
    </div>
  );
}

function FieldX({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;
}

function SimpleList({ rows, render, empty }: { rows: any[]; render: (r: any) => React.ReactNode; empty: string }) {
  if (!rows.length) return <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{empty}</div>;
  return <div className="space-y-2">{rows.map((r) => render(r))}</div>;
}

function SimpleTable({ cols, rows, empty }: { cols: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (!rows.length) return <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{empty}</div>;
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>{cols.map((c, i) => <th key={i} className="px-3 py-2 text-left">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {r.map((cell, j) => <td key={j} className="px-3 py-2 capitalize">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddPropertyDialog({ customerId, companyId, userId, defaultAddress, onAdded }: { customerId: string; companyId: string | null; userId: string | null; defaultAddress: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: defaultAddress,
    city: "",
    region: "",
    postal_code: "",
    type: "single_family" as "single_family" | "multi_family" | "office" | "retail" | "industrial" | "healthcare" | "education" | "other",
    units: "1",
    system_count: "1",
    access_notes: "",
  });
  const submit = async () => {
    if (!companyId) return toast.error("Workspace still loading");
    if (!form.address.trim()) return toast.error("Address is required");
    setSaving(true);
    const { error } = await supabase.from("properties").insert({
      company_id: companyId,
      customer_id: customerId,
      name: form.name || null,
      address: form.address.trim(),
      city: form.city || null,
      region: form.region || null,
      postal_code: form.postal_code || null,
      type: form.type,
      units: Number(form.units) || 1,
      system_count: Number(form.system_count) || 1,
      access_notes: form.access_notes || null,
      created_by: userId,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Property added");
    setOpen(false);
    setForm({ ...form, name: "", address: "", city: "", region: "", postal_code: "", access_notes: "" });
    onAdded();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add property</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Add a property for this customer</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldX label="Nickname (optional)"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main office" /></FieldX>
          <FieldX label="Type">
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as typeof form.type })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single_family">Single family</SelectItem>
                <SelectItem value="multi_family">Multi family</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FieldX>
          <div className="sm:col-span-2"><FieldX label="Street address *"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" /></FieldX></div>
          <FieldX label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></FieldX>
          <FieldX label="State / Region"><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></FieldX>
          <FieldX label="Postal code"><Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} /></FieldX>
          <FieldX label="Units"><Input type="number" min="1" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} /></FieldX>
          <FieldX label="HVAC systems"><Input type="number" min="1" value={form.system_count} onChange={(e) => setForm({ ...form, system_count: e.target.value })} /></FieldX>
          <div className="sm:col-span-2"><FieldX label="Access notes"><Textarea rows={2} value={form.access_notes} onChange={(e) => setForm({ ...form, access_notes: e.target.value })} placeholder="Gate code, lockbox, pets, etc." /></FieldX></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>{saving ? "Saving…" : "Add property"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CommunicationLog({ comms, onLog }: { comms: any[]; onLog: (f: { channel: string; direction: string; subject: string; body: string }) => void }) {
  const [form, setForm] = useState({ channel: "call", direction: "outbound", subject: "", body: "" });
  const submit = () => {
    if (!form.body && !form.subject) return toast.error("Add a subject or body");
    onLog(form);
    setForm({ channel: form.channel, direction: form.direction, subject: "", body: "" });
  };
  const tone: Record<string, string> = {
    call: "bg-primary/10 text-primary", email: "bg-[oklch(0.7_0.14_300)/0.15] text-[oklch(0.42_0.14_300)]",
    sms: "bg-[oklch(0.65_0.16_150)/0.18] text-[oklch(0.38_0.16_150)]", note: "bg-muted text-foreground",
  };
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Log communication</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[140px_140px_1fr]">
          <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="note">Note</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="outbound">Outbound</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Subject (optional)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Textarea className="md:col-span-3" rows={2} placeholder="What was discussed?" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <div className="md:col-span-3 flex justify-end"><Button size="sm" onClick={submit} style={{ backgroundImage: "var(--gradient-primary)" }}>Log entry</Button></div>
        </CardContent>
      </Card>

      {comms.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No communication logged yet.</div>
      ) : (
        <ol className="relative space-y-3 border-l border-border pl-5">
          {comms.map((m) => (
            <li key={m.id} className="relative">
              <span className="absolute -left-[26px] top-2 h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="rounded-md border border-border bg-card p-3">
                <div className="flex items-center gap-2 text-xs">
                  <Badge className={`${tone[m.channel] ?? "bg-muted"} border-transparent capitalize`}>{m.channel}</Badge>
                  <span className="text-muted-foreground capitalize">{m.direction}</span>
                  <span className="ml-auto text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
                </div>
                {m.subject && <div className="mt-1 text-sm font-medium">{m.subject}</div>}
                {m.body && <div className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{m.body}</div>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}