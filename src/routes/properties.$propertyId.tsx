import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, KeyRound, PawPrint, Clock, MapPin, Wrench, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];

const PROPERTY_TYPES = ["single_family","multi_family","office","retail","industrial","healthcare","education","other"] as const;
const EQUIPMENT_TYPES = ["Air Conditioner","Furnace","Heat Pump","Mini-Split","Boiler","Air Handler","Thermostat","Water Heater","Rooftop Unit"];

export const Route = createFileRoute("/properties/$propertyId")({ component: PropertyProfile });

function PropertyProfile() {
  const { propertyId } = Route.useParams();
  const { companyId, user } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState<any | null>(null);
  const [customer, setCustomer] = useState<{ id: string; name: string } | null>(null);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  const reload = async () => {
    const { data: pr } = await supabase.from("properties").select("*").eq("id", propertyId).maybeSingle();
    setP(pr);
    if (pr?.customer_id) {
      const { data: c } = await supabase.from("customers").select("id,name").eq("id", pr.customer_id).maybeSingle();
      setCustomer(c);
    }
    const [{ data: e }, { data: j }] = await Promise.all([
      supabase.from("equipment").select("*").eq("property_id", propertyId).order("created_at", { ascending: false }),
      supabase.from("jobs").select("id,job_number,title,status,scheduled_start").eq("property_id", propertyId).order("created_at", { ascending: false }).limit(20),
    ]);
    setEquipment(e ?? []);
    setJobs(j ?? []);
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [propertyId]);

  const save = async (patch: PropertyUpdate) => {
    if (!p) return;
    setP({ ...p, ...patch });
    const { error } = await supabase.from("properties").update(patch).eq("id", p.id);
    if (error) toast.error(error.message);
  };

  const removeProperty = async () => {
    if (!p) return;
    if (!confirm("Delete this property? This cannot be undone.")) return;
    const { error } = await supabase.from("properties").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Property deleted");
    navigate({ to: "/properties" });
  };

  if (!p) return <div className="p-8 text-sm text-muted-foreground">Loading property…</div>;

  return (
    <>
      <PageHeader
        title={p.name ?? p.address}
        description={p.address}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/properties"><ArrowLeft className="mr-2 h-4 w-4" /> All properties</Link></Button>
            <Button variant="outline" size="sm" onClick={removeProperty} className="text-destructive hover:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
          </div>
        }
      />
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Property details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FieldX label="Nickname"><Input value={p.name ?? ""} onChange={(e) => setP({ ...p, name: e.target.value })} onBlur={(e) => save({ name: e.target.value })} /></FieldX>
              <FieldX label="Type">
                <Select value={p.type ?? "single_family"} onValueChange={(v) => save({ type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace("_"," ")}</SelectItem>)}</SelectContent>
                </Select>
              </FieldX>
              <FieldX label="Address" className="md:col-span-2"><Input value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} onBlur={(e) => save({ address: e.target.value })} /></FieldX>
              <FieldX label="City"><Input value={p.city ?? ""} onChange={(e) => setP({ ...p, city: e.target.value })} onBlur={(e) => save({ city: e.target.value })} /></FieldX>
              <FieldX label="State / Region"><Input value={p.region ?? ""} onChange={(e) => setP({ ...p, region: e.target.value })} onBlur={(e) => save({ region: e.target.value })} /></FieldX>
              <FieldX label="Postal code"><Input value={p.postal_code ?? ""} onChange={(e) => setP({ ...p, postal_code: e.target.value })} onBlur={(e) => save({ postal_code: e.target.value })} /></FieldX>
              <FieldX label="Square footage"><Input type="number" value={p.square_feet ?? ""} onChange={(e) => setP({ ...p, square_feet: e.target.value ? Number(e.target.value) : null })} onBlur={(e) => save({ square_feet: e.target.value ? Number(e.target.value) : null })} /></FieldX>
              <FieldX label="HVAC systems on site"><Input type="number" min="1" value={p.system_count ?? 1} onChange={(e) => setP({ ...p, system_count: Number(e.target.value) })} onBlur={(e) => save({ system_count: Number(e.target.value) })} /></FieldX>
              <FieldX label="Notes" className="md:col-span-2"><Textarea rows={2} value={p.notes ?? ""} onChange={(e) => setP({ ...p, notes: e.target.value })} onBlur={(e) => save({ notes: e.target.value })} /></FieldX>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> Access info</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FieldX label="Gate code"><Input value={p.gate_code ?? ""} onChange={(e) => setP({ ...p, gate_code: e.target.value })} onBlur={(e) => save({ gate_code: e.target.value })} /></FieldX>
              <FieldX label={<span className="flex items-center gap-1"><PawPrint className="h-3 w-3" /> Pets on site</span>}><Input value={p.pets ?? ""} onChange={(e) => setP({ ...p, pets: e.target.value })} onBlur={(e) => save({ pets: e.target.value })} placeholder="2 dogs (friendly)" /></FieldX>
              <FieldX label={<span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Preferred appointment times</span>} className="md:col-span-2"><Input value={p.preferred_appointment_times ?? ""} onChange={(e) => setP({ ...p, preferred_appointment_times: e.target.value })} onBlur={(e) => save({ preferred_appointment_times: e.target.value })} placeholder="Weekdays 9am – 3pm" /></FieldX>
              <FieldX label="Access notes" className="md:col-span-2"><Textarea rows={3} value={p.access_notes ?? ""} onChange={(e) => setP({ ...p, access_notes: e.target.value })} onBlur={(e) => save({ access_notes: e.target.value })} placeholder="Park in front, side gate sticks, attic ladder behind master closet…" /></FieldX>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Equipment on site</CardTitle>
              <AddEquipmentDialog
                propertyId={p.id}
                customerId={p.customer_id}
                companyId={companyId}
                userId={user?.id ?? null}
                onAdded={reload}
              />
            </CardHeader>
            <CardContent>
              {equipment.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No equipment yet. Add equipment for this property.</div>
              ) : (
                <div className="space-y-2">
                  {equipment.map((e) => (
                    <Link key={e.id} to="/equipment/$equipmentId" params={{ equipmentId: e.id }} className="flex items-center justify-between rounded-md border border-border bg-card p-3 hover:bg-muted/40">
                      <div>
                        <div className="font-medium">{e.brand ?? "—"} {e.model ?? ""}</div>
                        <div className="text-xs text-muted-foreground">{e.type}{e.tonnage ? ` • ${e.tonnage} ton` : ""}{e.seer_rating ? ` • ${e.seer_rating} SEER` : ""}</div>
                      </div>
                      <Badge variant="outline" className="capitalize">{e.status}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Recent jobs at this property</CardTitle></CardHeader>
            <CardContent>
              {jobs.length === 0 ? <div className="text-sm text-muted-foreground">No jobs yet.</div> : (
                <div className="space-y-2">
                  {jobs.map((j) => (
                    <div key={j.id} className="flex items-center justify-between rounded-md border border-border bg-card p-3">
                      <div>
                        <div className="font-medium">{j.job_number} — {j.title}</div>
                        <div className="text-xs text-muted-foreground">{j.scheduled_start?.slice(0, 16).replace("T", " ") ?? "—"}</div>
                      </div>
                      <Badge variant="outline" className="capitalize">{j.status?.replace("_", " ")}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">{p.address}</span></div>
              {customer && <Link to="/customers/$customerId" params={{ customerId: customer.id }} className="block text-sm text-primary hover:underline">{customer.name} →</Link>}
              <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
                <Stat label="Sq ft" value={p.square_feet ?? "—"} />
                <Stat label="Systems" value={p.system_count ?? 1} />
                <Stat label="Equipment" value={equipment.length} />
                <Stat label="Jobs" value={jobs.length} />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}

function FieldX({ label, className, children }: { label: React.ReactNode; className?: string; children: React.ReactNode }) {
  return <div className={"space-y-1 " + (className ?? "")}><Label className="text-xs">{label}</Label>{children}</div>;
}

function Stat({ label, value }: { label: string; value: any }) {
  return <div className="rounded-md border border-border bg-muted/30 p-2.5"><div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-0.5 font-semibold">{value}</div></div>;
}

function AddEquipmentDialog({ propertyId, customerId, companyId, userId, onAdded }: { propertyId: string; customerId: string | null; companyId: string | null; userId: string | null; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: "Air Conditioner", brand: "", model: "", serial_number: "", tonnage: "", seer_rating: "", refrigerant_type: "", installed_on: "", warranty_expires: "", notes: "" });

  const submit = async () => {
    if (!companyId) return toast.error("No company linked to your account.");
    if (!form.type) return toast.error("Type is required");
    setSaving(true);
    const { error } = await supabase.from("equipment").insert({
      company_id: companyId,
      property_id: propertyId,
      customer_id: customerId,
      type: form.type,
      brand: form.brand || null,
      model: form.model || null,
      serial_number: form.serial_number || null,
      tonnage: form.tonnage ? Number(form.tonnage) : null,
      seer_rating: form.seer_rating ? Number(form.seer_rating) : null,
      refrigerant_type: form.refrigerant_type || null,
      installed_on: form.installed_on || null,
      warranty_expires: form.warranty_expires || null,
      notes: form.notes || null,
      created_by: userId,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Equipment added");
    setOpen(false);
    setForm({ ...form, brand: "", model: "", serial_number: "", tonnage: "", seer_rating: "", refrigerant_type: "", installed_on: "", warranty_expires: "", notes: "" });
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add equipment</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Add equipment to this property</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldX label="Type">
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{EQUIPMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </FieldX>
          <FieldX label="Brand"><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Carrier, Trane, Lennox…" /></FieldX>
          <FieldX label="Model"><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></FieldX>
          <FieldX label="Serial number"><Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></FieldX>
          <FieldX label="Tonnage"><Input type="number" step="0.5" value={form.tonnage} onChange={(e) => setForm({ ...form, tonnage: e.target.value })} /></FieldX>
          <FieldX label="SEER rating"><Input type="number" step="0.1" value={form.seer_rating} onChange={(e) => setForm({ ...form, seer_rating: e.target.value })} /></FieldX>
          <FieldX label="Refrigerant"><Input value={form.refrigerant_type} onChange={(e) => setForm({ ...form, refrigerant_type: e.target.value })} placeholder="R-410A" /></FieldX>
          <FieldX label="Install date"><Input type="date" value={form.installed_on} onChange={(e) => setForm({ ...form, installed_on: e.target.value })} /></FieldX>
          <FieldX label="Warranty expires"><Input type="date" value={form.warranty_expires} onChange={(e) => setForm({ ...form, warranty_expires: e.target.value })} /></FieldX>
          <div className="sm:col-span-2"><FieldX label="Notes"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></FieldX></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>{saving ? "Saving…" : "Add equipment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}