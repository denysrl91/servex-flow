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
import { ArrowLeft, Image as ImageIcon, Plus, Trash2, ShieldCheck, Calendar, Snowflake, Gauge } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type EquipmentUpdate = Database["public"]["Tables"]["equipment"]["Update"];

export const Route = createFileRoute("/equipment/$equipmentId")({ component: EquipmentProfile });

function EquipmentProfile() {
  const { equipmentId } = Route.useParams();
  const { companyId, user } = useAuth();
  const [e, setE] = useState<any | null>(null);
  const [property, setProperty] = useState<any | null>(null);
  const [customer, setCustomer] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);

  const reload = async () => {
    const { data: er } = await supabase.from("equipment").select("*").eq("id", equipmentId).maybeSingle();
    setE(er);
    if (er?.property_id) {
      const { data: p } = await supabase.from("properties").select("*").eq("id", er.property_id).maybeSingle();
      setProperty(p);
    }
    if (er?.customer_id) {
      const { data: c } = await supabase.from("customers").select("id,name").eq("id", er.customer_id).maybeSingle();
      setCustomer(c);
    }
    const [{ data: j }, { data: ph }] = await Promise.all([
      supabase.from("jobs").select("id,job_number,title,status,scheduled_start,actual_end").eq("equipment_id", equipmentId).order("created_at", { ascending: false }),
      supabase.from("equipment_photos").select("*").eq("equipment_id", equipmentId).order("created_at", { ascending: false }),
    ]);
    setJobs(j ?? []);
    setPhotos(ph ?? []);
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [equipmentId]);

  const save = async (patch: EquipmentUpdate) => {
    if (!e) return;
    setE({ ...e, ...patch });
    await supabase.from("equipment").update(patch).eq("id", e.id);
  };

  const addPhoto = async () => {
    const url = window.prompt("Image URL"); if (!url || !companyId || !e) return;
    const caption = window.prompt("Caption (optional)") ?? null;
    await supabase.from("equipment_photos").insert({ company_id: companyId, equipment_id: e.id, url, caption, created_by: user?.id ?? null });
    reload();
  };
  const removePhoto = async (id: string) => { await supabase.from("equipment_photos").delete().eq("id", id); reload(); };

  if (!e) return <div className="p-8 text-sm text-muted-foreground">Loading equipment…</div>;

  const repairs = jobs.filter((j) => /repair|fix|broken/i.test(j.title ?? ""));
  const maintenance = jobs.filter((j) => /maint|tune|clean|inspect/i.test(j.title ?? ""));
  const warrantyDays = e.warranty_expires ? Math.ceil((new Date(e.warranty_expires).getTime() - Date.now()) / 86400000) : null;

  return (
    <>
      <PageHeader
        title={`${e.brand ?? ""} ${e.model ?? ""}`.trim() || e.type}
        description={`${e.type}${e.serial_number ? " • S/N " + e.serial_number : ""}`}
        actions={<Link to="/equipment"><Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> All equipment</Button></Link>}
      />
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Specifications</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <FieldX label="Type"><Input value={e.type} onChange={(ev) => setE({ ...e, type: ev.target.value })} onBlur={(ev) => save({ type: ev.target.value })} /></FieldX>
              <FieldX label="Brand"><Input value={e.brand ?? ""} onChange={(ev) => setE({ ...e, brand: ev.target.value })} onBlur={(ev) => save({ brand: ev.target.value })} /></FieldX>
              <FieldX label="Model"><Input value={e.model ?? ""} onChange={(ev) => setE({ ...e, model: ev.target.value })} onBlur={(ev) => save({ model: ev.target.value })} /></FieldX>
              <FieldX label="Serial number"><Input value={e.serial_number ?? ""} onChange={(ev) => setE({ ...e, serial_number: ev.target.value })} onBlur={(ev) => save({ serial_number: ev.target.value })} /></FieldX>
              <FieldX label="Tonnage"><Input type="number" step="0.5" value={e.tonnage ?? ""} onChange={(ev) => setE({ ...e, tonnage: ev.target.value ? Number(ev.target.value) : null })} onBlur={(ev) => save({ tonnage: ev.target.value ? Number(ev.target.value) : null })} /></FieldX>
              <FieldX label="SEER rating"><Input type="number" step="0.1" value={e.seer_rating ?? ""} onChange={(ev) => setE({ ...e, seer_rating: ev.target.value ? Number(ev.target.value) : null })} onBlur={(ev) => save({ seer_rating: ev.target.value ? Number(ev.target.value) : null })} /></FieldX>
              <FieldX label="Refrigerant"><Input value={e.refrigerant_type ?? ""} onChange={(ev) => setE({ ...e, refrigerant_type: ev.target.value })} onBlur={(ev) => save({ refrigerant_type: ev.target.value })} /></FieldX>
              <FieldX label="Install date"><Input type="date" value={e.installed_on ?? ""} onChange={(ev) => setE({ ...e, installed_on: ev.target.value })} onBlur={(ev) => save({ installed_on: ev.target.value || null })} /></FieldX>
              <FieldX label="Warranty expires"><Input type="date" value={e.warranty_expires ?? ""} onChange={(ev) => setE({ ...e, warranty_expires: ev.target.value })} onBlur={(ev) => save({ warranty_expires: ev.target.value || null })} /></FieldX>
              <FieldX label="Notes" className="md:col-span-3"><Textarea rows={3} value={e.notes ?? ""} onChange={(ev) => setE({ ...e, notes: ev.target.value })} onBlur={(ev) => save({ notes: ev.target.value })} /></FieldX>
            </CardContent>
          </Card>

          <Tabs defaultValue="maintenance">
            <TabsList>
              <TabsTrigger value="maintenance">Maintenance history</TabsTrigger>
              <TabsTrigger value="repairs">Repair history</TabsTrigger>
              <TabsTrigger value="all">All jobs</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>
            <TabsContent value="maintenance" className="mt-4"><HistoryTable jobs={maintenance} empty="No maintenance visits recorded." /></TabsContent>
            <TabsContent value="repairs" className="mt-4"><HistoryTable jobs={repairs} empty="No repairs recorded." /></TabsContent>
            <TabsContent value="all" className="mt-4"><HistoryTable jobs={jobs} empty="No jobs yet." /></TabsContent>
            <TabsContent value="photos" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Equipment photos</CardTitle>
                  <Button size="sm" variant="outline" onClick={addPhoto}><Plus className="mr-2 h-4 w-4" /> Add photo URL</Button>
                </CardHeader>
                <CardContent>
                  {photos.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><ImageIcon className="h-4 w-4" /> No photos yet.</div>
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
          </Tabs>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5 text-sm">
              <Badge variant="outline" className="capitalize">{e.status}</Badge>
              {customer && <div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Customer</div><Link to="/customers/$customerId" params={{ customerId: customer.id }} className="font-medium text-primary hover:underline">{customer.name}</Link></div>}
              {property && <div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Property</div><Link to="/properties/$propertyId" params={{ propertyId: property.id }} className="font-medium hover:underline">{property.name ?? property.address}</Link></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Warranty</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {e.warranty_expires ? (
                <>
                  <div className="text-muted-foreground">Expires <span className="font-medium text-foreground">{e.warranty_expires}</span></div>
                  {warrantyDays !== null && (
                    <Badge className={warrantyDays > 30 ? "bg-[oklch(0.65_0.16_150)/0.18] text-[oklch(0.38_0.16_150)] border-transparent" : warrantyDays > 0 ? "bg-[oklch(0.78_0.18_85)/0.2] text-[oklch(0.4_0.16_85)] border-transparent" : "bg-destructive/15 text-destructive border-transparent"}>
                      {warrantyDays > 0 ? `${warrantyDays} days remaining` : `Expired ${Math.abs(warrantyDays)} days ago`}
                    </Badge>
                  )}
                </>
              ) : <div className="text-sm text-muted-foreground">No warranty date set.</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Quick stats</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              <Stat icon={<Gauge className="h-3 w-3" />} label="Tonnage" value={e.tonnage ?? "—"} />
              <Stat icon={<Snowflake className="h-3 w-3" />} label="SEER" value={e.seer_rating ?? "—"} />
              <Stat icon={<Calendar className="h-3 w-3" />} label="Installed" value={e.installed_on ?? "—"} />
              <Stat icon={<Snowflake className="h-3 w-3" />} label="Refrigerant" value={e.refrigerant_type ?? "—"} />
              <Stat label="Maintenance" value={maintenance.length} />
              <Stat label="Repairs" value={repairs.length} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}

function HistoryTable({ jobs, empty }: { jobs: any[]; empty: string }) {
  if (!jobs.length) return <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{empty}</div>;
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr><th className="px-3 py-2 text-left">Job</th><th className="px-3 py-2 text-left">Title</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Status</th></tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id} className="border-t border-border">
              <td className="px-3 py-2 font-mono text-xs">{j.job_number}</td>
              <td className="px-3 py-2">{j.title}</td>
              <td className="px-3 py-2 text-muted-foreground">{j.actual_end?.slice(0, 10) ?? j.scheduled_start?.slice(0, 10) ?? "—"}</td>
              <td className="px-3 py-2"><Badge variant="outline" className="capitalize">{j.status?.replace("_", " ")}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FieldX({ label, className, children }: { label: React.ReactNode; className?: string; children: React.ReactNode }) {
  return <div className={"space-y-1 " + (className ?? "")}><Label className="text-xs">{label}</Label>{children}</div>;
}

function Stat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: any }) {
  return <div className="rounded-md border border-border bg-muted/30 p-2.5"><div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">{icon} {label}</div><div className="mt-0.5 font-semibold">{value}</div></div>;
}