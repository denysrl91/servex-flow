import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wrench } from "lucide-react";
import { toast } from "sonner";

const TYPES = ["Air Conditioner", "Furnace", "Heat Pump", "Mini-Split", "Boiler", "Air Handler", "Thermostat", "Water Heater", "Rooftop Unit"];

export const Route = createFileRoute("/equipment")({ component: EquipmentPage });

function EquipmentPage() {
  const { companyId, user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [props, setProps] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ property_id: "", customer_id: "", type: "Air Conditioner", brand: "", model: "", serial_number: "", tonnage: "", seer_rating: "", refrigerant_type: "", installed_on: "", warranty_expires: "" });

  const load = async () => {
    const [{ data: e }, { data: p }] = await Promise.all([
      supabase.from("equipment").select("*").order("created_at", { ascending: false }),
      supabase.from("properties").select("id,name,address,customer_id").order("created_at", { ascending: false }),
    ]);
    setRows(e ?? []);
    setProps(p ?? []);
  };
  useEffect(() => { load(); }, []);
  const pmap = Object.fromEntries(props.map((p) => [p.id, p.name ?? p.address]));

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.property_id) return toast.error("Pick a property");
    if (!form.type) return toast.error("Type required");
    const prop = props.find((p) => p.id === form.property_id);
    const { data, error } = await supabase.from("equipment").insert({
      company_id: companyId,
      property_id: form.property_id,
      customer_id: prop?.customer_id ?? null,
      type: form.type, brand: form.brand || null, model: form.model || null,
      serial_number: form.serial_number || null,
      tonnage: form.tonnage ? Number(form.tonnage) : null,
      seer_rating: form.seer_rating ? Number(form.seer_rating) : null,
      refrigerant_type: form.refrigerant_type || null,
      installed_on: form.installed_on || null,
      warranty_expires: form.warranty_expires || null,
      created_by: user?.id ?? null,
    }).select("id").single();
    if (error || !data) return toast.error(error?.message ?? "Failed");
    setOpen(false);
    toast.success("Equipment added");
    navigate({ to: "/equipment/$equipmentId", params: { equipmentId: data.id } });
  };

  return (
    <>
      <PageHeader title="Equipment" description="Every unit, with full service & repair history."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add equipment</Button></DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>New equipment</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Property" required className="sm:col-span-2">
                  <Select value={form.property_id} onValueChange={(v) => setForm({ ...form, property_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                    <SelectContent>{props.map((p) => <SelectItem key={p.id} value={p.id}>{p.name ?? p.address}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Type" required>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Brand"><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Field>
                <Field label="Model"><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></Field>
                <Field label="Serial number"><Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></Field>
                <Field label="Tonnage"><Input type="number" step="0.5" value={form.tonnage} onChange={(e) => setForm({ ...form, tonnage: e.target.value })} /></Field>
                <Field label="SEER rating"><Input type="number" step="0.1" value={form.seer_rating} onChange={(e) => setForm({ ...form, seer_rating: e.target.value })} /></Field>
                <Field label="Refrigerant"><Input value={form.refrigerant_type} onChange={(e) => setForm({ ...form, refrigerant_type: e.target.value })} placeholder="R-410A, R-32…" /></Field>
                <Field label="Install date"><Input type="date" value={form.installed_on} onChange={(e) => setForm({ ...form, installed_on: e.target.value })} /></Field>
                <Field label="Warranty expires"><Input type="date" value={form.warranty_expires} onChange={(e) => setForm({ ...form, warranty_expires: e.target.value })} /></Field>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create} style={{ backgroundImage: "var(--gradient-primary)" }}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="p-6">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Wrench className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No equipment yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Track every unit you've installed or serviced.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Equipment</th><th className="px-4 py-3 text-left">Property</th><th className="px-4 py-3 text-left">Specs</th><th className="px-4 py-3 text-left">Installed</th><th className="px-4 py-3 text-left">Warranty</th><th className="px-4 py-3 text-left">Status</th></tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="cursor-pointer border-t border-border hover:bg-muted/30" onClick={() => navigate({ to: "/equipment/$equipmentId", params: { equipmentId: e.id } })}>
                    <td className="px-4 py-3"><Link to="/equipment/$equipmentId" params={{ equipmentId: e.id }} className="font-medium hover:underline">{e.brand ?? "—"} {e.model ?? ""}</Link><div className="text-xs text-muted-foreground">{e.type}{e.serial_number ? ` • S/N ${e.serial_number}` : ""}</div></td>
                    <td className="px-4 py-3 text-muted-foreground">{pmap[e.property_id] ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{[e.tonnage ? `${e.tonnage} ton` : null, e.seer_rating ? `${e.seer_rating} SEER` : null, e.refrigerant_type].filter(Boolean).join(" • ") || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.installed_on ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.warranty_expires ?? "—"}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{e.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return <div className={"space-y-1.5 " + (className ?? "")}><Label>{label}{required && <span className="text-destructive"> *</span>}</Label>{children}</div>;
}