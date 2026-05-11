import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { setItemQuantity, fetchStock, totalOnHand } from "@/lib/inventory-api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory/items/edit")({ component: EditItem });

function EditItem() {
  const { itemId } = Route.useParams();
  const navigate = useNavigate();
  const { companyId } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);

  const item = useQuery({
    queryKey: ["inv-item", itemId],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory_items").select("*").eq("id", itemId).single();
      if (error) throw error;
      return data;
    },
  });
  const stock = useQuery({ queryKey: ["inv-stock"], queryFn: fetchStock });

  useEffect(() => {
    if (item.data && stock.data && !form) {
      const qty = totalOnHand(item.data.id, stock.data);
      setForm({
        sku: item.data.sku ?? "",
        name: item.data.name ?? "",
        description: item.data.description ?? "",
        category: item.data.category ?? "",
        unit: item.data.unit ?? "each",
        unit_cost: String(item.data.unit_cost ?? 0),
        unit_price: String(item.data.unit_price ?? 0),
        quantity: String(qty),
        reorder_point: String(item.data.reorder_point ?? 0),
        min_stock_level: String(item.data.min_stock_level ?? 0),
        barcode: item.data.barcode ?? "",
        vendor_name: item.data.vendor_name ?? "",
        vendor_email: item.data.vendor_email ?? "",
        vendor_phone: item.data.vendor_phone ?? "",
        track_serial: !!item.data.track_serial,
      });
    }
  }, [item.data, stock.data, form]);

  if (item.isLoading || !form) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }
  if (item.error) {
    return <div className="p-6 text-sm text-destructive">{(item.error as Error).message}</div>;
  }

  const set = (k: string, v: string | boolean) => setForm((f: any) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return toast.error("No company linked to your account.");
    setSaving(true);
    const { error } = await supabase.from("inventory_items").update({
      sku: form.sku.trim(),
      name: form.name.trim(),
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
    }).eq("id", itemId);
    if (error) {
      setSaving(false);
      console.error("inventory_items update failed", error);
      return toast.error(error.message);
    }
    try {
      await setItemQuantity(companyId, itemId, Number(form.quantity) || 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("stock update failed", err);
      toast.error(`Item updated, but stock failed: ${msg}`);
    }
    setSaving(false);
    qc.invalidateQueries({ queryKey: ["inv-items"] });
    qc.invalidateQueries({ queryKey: ["inv-stock"] });
    qc.invalidateQueries({ queryKey: ["inv-item", itemId] });
    toast.success("Item updated");
    navigate({ to: "/inventory/items" });
  };

  return (
    <>
      <PageHeader title={`Edit ${form.name || "item"}`} description="Update details, pricing, and stock." />
      <form onSubmit={onSubmit} className="space-y-4 p-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Basics</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="SKU" required><Input required value={form.sku} onChange={(e) => set("sku", e.target.value)} /></Field>
            <Field label="Name" required><Input required value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Category"><Input value={form.category} onChange={(e) => set("category", e.target.value)} /></Field>
            <Field label="Unit"><Input value={form.unit} onChange={(e) => set("unit", e.target.value)} /></Field>
            <Field label="Description" className="md:col-span-2"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pricing & stock</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <Field label="Unit cost ($)"><Input type="number" step="0.01" min="0" value={form.unit_cost} onChange={(e) => set("unit_cost", e.target.value)} /></Field>
            <Field label="Sale price ($)"><Input type="number" step="0.01" min="0" value={form.unit_price} onChange={(e) => set("unit_price", e.target.value)} /></Field>
            <Field label="Quantity on hand"><Input type="number" min="0" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} /></Field>
            <Field label="Reorder at"><Input type="number" min="0" value={form.reorder_point} onChange={(e) => set("reorder_point", e.target.value)} /></Field>
            <Field label="Minimum stock"><Input type="number" min="0" value={form.min_stock_level} onChange={(e) => set("min_stock_level", e.target.value)} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Identifiers & vendor</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Barcode / QR code"><Input value={form.barcode} onChange={(e) => set("barcode", e.target.value)} /></Field>
            <Field label="Vendor name"><Input value={form.vendor_name} onChange={(e) => set("vendor_name", e.target.value)} /></Field>
            <Field label="Vendor email"><Input type="email" value={form.vendor_email} onChange={(e) => set("vendor_email", e.target.value)} /></Field>
            <Field label="Vendor phone"><Input value={form.vendor_phone} onChange={(e) => set("vendor_phone", e.target.value)} /></Field>
            <div className="flex items-center gap-3 md:col-span-2">
              <Switch checked={form.track_serial} onCheckedChange={(v) => set("track_serial", v)} />
              <div>
                <div className="text-sm font-medium">Track serial numbers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/inventory/items" })}>Cancel</Button>
          <Button type="submit" disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>
            {saving ? "Saving..." : "Save changes"}
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
