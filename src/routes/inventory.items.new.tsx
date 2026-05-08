import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory/items/new")({ component: NewItem });

function NewItem() {
  const navigate = useNavigate();
  const { companyId } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    category: "",
    unit: "each",
    unit_cost: "0",
    unit_price: "0",
    reorder_point: "0",
    min_stock_level: "0",
    barcode: "",
    vendor_name: "",
    vendor_email: "",
    vendor_phone: "",
    track_serial: false,
  });
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return toast.error("Missing company");
    setSaving(true);
    const { error } = await supabase.from("inventory_items").insert({
      company_id: companyId,
      sku: form.sku,
      name: form.name,
      description: form.description || null,
      category: form.category || null,
      unit: form.unit,
      unit_cost: Number(form.unit_cost),
      unit_price: Number(form.unit_price),
      reorder_point: parseInt(form.reorder_point) || 0,
      min_stock_level: parseInt(form.min_stock_level) || 0,
      barcode: form.barcode || null,
      vendor_name: form.vendor_name || null,
      vendor_email: form.vendor_email || null,
      vendor_phone: form.vendor_phone || null,
      track_serial: form.track_serial,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Item added");
    navigate({ to: "/inventory/items" });
  };

  return (
    <>
      <PageHeader title="Add inventory item" description="Track parts, equipment, and supplies." />
      <form onSubmit={onSubmit} className="space-y-4 p-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Basics</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="SKU" required><Input required value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. CAP-440-30" /></Field>
            <Field label="Name" required><Input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Run Capacitor 440V 30µF" /></Field>
            <Field label="Category"><Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Capacitors, Refrigerant, Filter..." /></Field>
            <Field label="Unit"><Input value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="each, lb, ft" /></Field>
            <Field label="Description" className="md:col-span-2"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pricing & stock</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <Field label="Unit cost ($)"><Input type="number" step="0.01" min="0" value={form.unit_cost} onChange={(e) => set("unit_cost", e.target.value)} /></Field>
            <Field label="Sale price ($)"><Input type="number" step="0.01" min="0" value={form.unit_price} onChange={(e) => set("unit_price", e.target.value)} /></Field>
            <Field label="Reorder at"><Input type="number" min="0" value={form.reorder_point} onChange={(e) => set("reorder_point", e.target.value)} /></Field>
            <Field label="Minimum stock"><Input type="number" min="0" value={form.min_stock_level} onChange={(e) => set("min_stock_level", e.target.value)} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Identifiers & vendor</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Barcode / QR code"><Input value={form.barcode} onChange={(e) => set("barcode", e.target.value)} placeholder="Scan or type code" /></Field>
            <Field label="Vendor name"><Input value={form.vendor_name} onChange={(e) => set("vendor_name", e.target.value)} /></Field>
            <Field label="Vendor email"><Input type="email" value={form.vendor_email} onChange={(e) => set("vendor_email", e.target.value)} /></Field>
            <Field label="Vendor phone"><Input value={form.vendor_phone} onChange={(e) => set("vendor_phone", e.target.value)} /></Field>
            <div className="flex items-center gap-3 md:col-span-2">
              <Switch checked={form.track_serial} onCheckedChange={(v) => set("track_serial", v)} />
              <div>
                <div className="text-sm font-medium">Track serial numbers</div>
                <div className="text-xs text-muted-foreground">For equipment like compressors, condensers, furnaces.</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/inventory/items" })}>Cancel</Button>
          <Button type="submit" disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>
            {saving ? "Saving..." : "Save item"}
          </Button>
        </div>
      </form>
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