import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

const PROPERTY_TYPES = ["single_family", "multi_family", "condo", "commercial", "industrial"] as const;

export const Route = createFileRoute("/properties")({ component: PropertiesPage });

function PropertiesPage() {
  const { companyId, user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer_id: "", name: "", address: "", city: "", region: "", postal_code: "", type: "single_family", units: 1, system_count: 1, square_feet: "", access_notes: "", gate_code: "", pets: "", preferred_appointment_times: "" });

  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("customers").select("id,name").order("name"),
    ]);
    setRows(p ?? []);
    setCustomers(c ?? []);
  };
  useEffect(() => { load(); }, []);
  const cmap = Object.fromEntries(customers.map((c) => [c.id, c.name]));

  const remove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this property? This cannot be undone.")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Property deleted");
    setRows((r) => r.filter((p) => p.id !== id));
  };

  const create = async () => {
    if (!companyId) return toast.error("Missing company");
    if (!form.customer_id) return toast.error("Pick a customer");
    if (!form.address) return toast.error("Address required");
    const { data, error } = await supabase.from("properties").insert({
      company_id: companyId, customer_id: form.customer_id,
      name: form.name || null, address: form.address, city: form.city || null, region: form.region || null, postal_code: form.postal_code || null,
      type: form.type as any, units: form.units, system_count: form.system_count,
      square_feet: form.square_feet ? Number(form.square_feet) : null,
      access_notes: form.access_notes || null, gate_code: form.gate_code || null, pets: form.pets || null,
      preferred_appointment_times: form.preferred_appointment_times || null,
      created_by: user?.id ?? null,
    }).select("id").single();
    if (error || !data) return toast.error(error?.message ?? "Failed");
    setOpen(false);
    toast.success("Property added");
    navigate({ to: "/properties/$propertyId", params: { propertyId: data.id } });
  };

  return (
    <>
      <PageHeader title="Properties" description="Service locations with access notes & system counts."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add property</Button></DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>New property</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Customer" required className="sm:col-span-2">
                  <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Nickname"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main office" /></Field>
                <Field label="Type">
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Address" required className="sm:col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
                <Field label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
                <Field label="State / Region"><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></Field>
                <Field label="Postal code"><Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} /></Field>
                <Field label="Square footage"><Input type="number" value={form.square_feet} onChange={(e) => setForm({ ...form, square_feet: e.target.value })} /></Field>
                <Field label="Number of HVAC systems"><Input type="number" min="1" value={form.system_count} onChange={(e) => setForm({ ...form, system_count: Number(e.target.value) })} /></Field>
                <Field label="Units"><Input type="number" min="1" value={form.units} onChange={(e) => setForm({ ...form, units: Number(e.target.value) })} /></Field>
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
            <MapPin className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No properties yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add a service location for a customer.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Property</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-right">Sq ft</th><th className="px-4 py-3 text-right">Systems</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="cursor-pointer border-t border-border hover:bg-muted/30" onClick={() => navigate({ to: "/properties/$propertyId", params: { propertyId: p.id } })}>
                    <td className="px-4 py-3"><Link to="/properties/$propertyId" params={{ propertyId: p.id }} className="font-medium hover:underline">{p.name ?? p.address}</Link><div className="text-xs text-muted-foreground">{p.address}</div></td>
                    <td className="px-4 py-3">{cmap[p.customer_id] ?? "—"}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{p.type?.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3 text-right">{p.square_feet ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">{p.system_count ?? 1}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" onClick={(e) => remove(e, p.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                    </td>
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