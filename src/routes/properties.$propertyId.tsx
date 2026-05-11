import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, KeyRound, PawPrint, Clock, MapPin, Wrench } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];

export const Route = createFileRoute("/properties/$propertyId")({ component: PropertyProfile });

function PropertyProfile() {
  const { propertyId } = Route.useParams();
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
    await supabase.from("properties").update(patch).eq("id", p.id);
  };

  if (!p) return <div className="p-8 text-sm text-muted-foreground">Loading property…</div>;

  return (
    <>
      <PageHeader
        title={p.name ?? p.address}
        description={p.address}
        actions={<Button asChild variant="outline" size="sm"><Link to="/properties"><ArrowLeft className="mr-2 h-4 w-4" /> All properties</Link></Button>}
      />
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Property details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FieldX label="Nickname"><Input value={p.name ?? ""} onChange={(e) => setP({ ...p, name: e.target.value })} onBlur={(e) => save({ name: e.target.value })} /></FieldX>
              <FieldX label="Type">
                <Input value={(p.type ?? "").replace("_", " ")} disabled />
              </FieldX>
              <FieldX label="Address"><Input value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} onBlur={(e) => save({ address: e.target.value })} /></FieldX>
              <FieldX label="City"><Input value={p.city ?? ""} onChange={(e) => setP({ ...p, city: e.target.value })} onBlur={(e) => save({ city: e.target.value })} /></FieldX>
              <FieldX label="Square footage"><Input type="number" value={p.square_feet ?? ""} onChange={(e) => setP({ ...p, square_feet: e.target.value ? Number(e.target.value) : null })} onBlur={(e) => save({ square_feet: e.target.value ? Number(e.target.value) : null })} /></FieldX>
              <FieldX label="HVAC systems on site"><Input type="number" min="1" value={p.system_count ?? 1} onChange={(e) => setP({ ...p, system_count: Number(e.target.value) })} onBlur={(e) => save({ system_count: Number(e.target.value) })} /></FieldX>
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
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Equipment on site</CardTitle></CardHeader>
            <CardContent>
              {equipment.length === 0 ? <div className="text-sm text-muted-foreground">No equipment recorded.</div> : (
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