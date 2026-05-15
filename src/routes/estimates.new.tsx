import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronRight, FileText, Package, Plus, Trash2, UserPlus, Wrench } from "lucide-react";
import { nextDocNumber } from "@/lib/crm-api";
import { useAllPriceBook } from "@/lib/price-book-store";
import type { EstimateLineItem } from "@/lib/estimates-api";

export const Route = createFileRoute("/estimates/new")({ component: NewEstimate });

type CustomerOpt = { id: string; name: string; email: string | null; phone: string | null; service_address: string | null };
type PropertyOpt = { id: string; label: string; customer_id: string | null; address: string };
type InventoryItem = { id: string; sku: string; name: string; unit_price: number; category: string | null; description: string | null };
type PriceEntry = ReturnType<typeof useAllPriceBook>[number];
type LineDraft = {
  id: string;
  optionKey: "good" | "better" | "best";
  type: EstimateLineItem["type"];
  item_id: string | null;
  source: "manual" | "inventory" | "pricebook";
  description: string;
  quantity: number;
  unit_price: number;
};

type OptionDraft = {
  key: "good" | "better" | "best";
  tier: "good" | "better" | "best";
  name: string;
  description: string;
  warranty_years: number;
  efficiency_rating: string;
  is_recommended: boolean;
  highlights: string;
};

const optionDefaults: OptionDraft[] = [
  {
    key: "good",
    tier: "good",
    name: "Good — Reliable Comfort",
    description: "Essential repair or replacement scope with dependable equipment and standard labor coverage.",
    warranty_years: 5,
    efficiency_rating: "14 SEER2",
    is_recommended: false,
    highlights: "Code-compliant installation\nStandard parts warranty\nBest fit for budget-driven work",
  },
  {
    key: "better",
    tier: "better",
    name: "Better — Smart Efficiency",
    description: "Balanced comfort, efficiency, and warranty coverage for most homes and light commercial spaces.",
    warranty_years: 10,
    efficiency_rating: "16 SEER2",
    is_recommended: true,
    highlights: "Higher-efficiency equipment\nSmart thermostat ready\nStrong long-term value",
  },
  {
    key: "best",
    tier: "best",
    name: "Best — Premium Comfort",
    description: "Premium system design with advanced comfort, improved indoor air quality, and extended coverage.",
    warranty_years: 12,
    efficiency_rating: "20 SEER2",
    is_recommended: false,
    highlights: "Variable-speed comfort\nPremium air quality options\nLongest warranty coverage",
  },
];

function NewEstimate() {
  const navigate = useNavigate();
  const { companyId, user } = useAuth();
  const priceBook = useAllPriceBook();
  const [customers, setCustomers] = useState<CustomerOpt[]>([]);
  const [properties, setProperties] = useState<PropertyOpt[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeOption, setActiveOption] = useState<LineDraft["optionKey"]>("better");
  const [options, setOptions] = useState<OptionDraft[]>(optionDefaults);
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [form, setForm] = useState({
    title: "HVAC Estimate",
    customer_mode: "existing" as "existing" | "new",
    customer_id: "",
    customer_name: "",
    contact_name: "",
    customer_email: "",
    customer_phone: "",
    customer_type: "residential" as "residential" | "commercial",
    billing_address: "",
    customer_notes: "",
    property_mode: "none" as "none" | "existing" | "new",
    property_id: "",
    property_name: "",
    property_address: "",
    property_city: "",
    property_region: "",
    property_postal_code: "",
    property_type: "single_family",
    system_count: "1",
    access_notes: "",
    expires_at: "",
    tax_rate: "8",
    disclaimer:
      "Pricing is valid through the expiration date shown. Final scope is subject to field verification, code requirements, permitting, and equipment availability. Customer approval authorizes scheduling and procurement for the selected option.",
  });

  const loadLists = async () => {
    const [{ data: c, error: cErr }, { data: p, error: pErr }, { data: i, error: iErr }] = await Promise.all([
      supabase.from("customers").select("id,name,email,phone,service_address").order("name"),
      supabase.from("properties").select("id,name,address,city,region,customer_id").order("created_at", { ascending: false }).limit(500),
      supabase.from("inventory_items").select("id,sku,name,unit_price,category,description").eq("status", "active").order("name").limit(500),
    ]);
    if (cErr || pErr || iErr) {
      toast.error(cErr?.message ?? pErr?.message ?? iErr?.message ?? "Could not load estimate data");
    }
    setCustomers((c ?? []) as CustomerOpt[]);
    setProperties(
      (p ?? []).map((x) => ({
        id: x.id,
        customer_id: x.customer_id,
        address: x.address,
        label: `${x.name ? `${x.name} — ` : ""}${x.address}${x.city ? `, ${x.city}` : ""}${x.region ? ` ${x.region}` : ""}`,
      })),
    );
    setInventory((i ?? []) as InventoryItem[]);
  };

  useEffect(() => {
    loadLists();
  }, []);

  const filteredProperties = useMemo(() => {
    if (!form.customer_id) return properties;
    return properties.filter((p) => p.customer_id === form.customer_id);
  }, [form.customer_id, properties]);

  const totals = useMemo(() => {
    const byOption = { good: 0, better: 0, best: 0 } as Record<LineDraft["optionKey"], number>;
    for (const line of lines) byOption[line.optionKey] += line.quantity * line.unit_price;
    const recommended = options.find((o) => o.is_recommended)?.key ?? "better";
    const subtotal = byOption[recommended] ?? 0;
    const tax = Math.round(subtotal * (Number(form.tax_rate || 0) / 100) * 100) / 100;
    return { byOption, recommended, subtotal, tax, total: subtotal + tax };
  }, [form.tax_rate, lines, options]);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const updateOption = (key: OptionDraft["key"], patch: Partial<OptionDraft>) => {
    setOptions((current) => current.map((option) => {
      if (option.key !== key) return patch.is_recommended ? { ...option, is_recommended: false } : option;
      return { ...option, ...patch };
    }));
  };

  const addManualLine = (type: EstimateLineItem["type"]) => {
    setLines((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        optionKey: activeOption,
        type,
        item_id: null,
        source: "manual",
        description: type === "labor" ? "Labor" : type === "equipment" ? "Equipment" : "Material",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  };

  const addInventoryLine = (id: string) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;
    setLines((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        optionKey: activeOption,
        type: "material",
        item_id: item.id,
        source: "inventory",
        description: `${item.sku} — ${item.name}`,
        quantity: 1,
        unit_price: Number(item.unit_price ?? 0),
      },
    ]);
  };

  const addPriceBookLine = (value: string) => {
    const [kind, code] = value.split("::");
    const entry = priceBook.find((p) => p.kind === kind && p.item.code === code);
    if (!entry) return;
    setLines((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        optionKey: activeOption,
        type: entry.kind === "services" ? "labor" : "equipment",
        item_id: null,
        source: "pricebook",
        description: `${entry.item.code} — ${entry.item.name}`,
        quantity: 1,
        unit_price: Number(entry.item.price ?? 0),
      },
    ]);
  };

  const updateLine = (id: string, patch: Partial<LineDraft>) => {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const removeLine = (id: string) => setLines((current) => current.filter((line) => line.id !== id));

  const createCustomer = async () => {
    if (!companyId) throw new Error("Workspace is still loading");
    const name = form.customer_name.trim();
    if (!name) throw new Error("Enter a customer name or select an existing customer");
    const { data, error } = await supabase
      .from("customers")
      .insert({
        company_id: companyId,
        name,
        contact_name: form.contact_name || null,
        type: form.customer_type,
        email: form.customer_email || null,
        phone: form.customer_phone || null,
        service_address: form.property_address || form.billing_address || null,
        billing_address: form.billing_address || null,
        notes: form.customer_notes || null,
        created_by: user?.id ?? null,
      })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("Could not create customer");
    return data.id as string;
  };

  const createProperty = async (customerId: string) => {
    if (!companyId) throw new Error("Workspace is still loading");
    const address = form.property_address.trim();
    if (!address) return null;
    const { data, error } = await supabase
      .from("properties")
      .insert({
        company_id: companyId,
        customer_id: customerId,
        name: form.property_name || null,
        address,
        city: form.property_city || null,
        region: form.property_region || null,
        postal_code: form.property_postal_code || null,
        type: form.property_type,
        system_count: Number(form.system_count || 1),
        access_notes: form.access_notes || null,
        created_by: user?.id ?? null,
      })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("Could not create property");
    return data.id as string;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return toast.error("Workspace still loading — try again in a moment");
    setSaving(true);
    try {
      const customerId = form.customer_mode === "existing" ? form.customer_id : await createCustomer();
      if (!customerId) throw new Error("Select a customer or create a new customer");

      let propertyId: string | null = form.property_mode === "existing" ? form.property_id || null : null;
      if (form.property_mode === "new") propertyId = await createProperty(customerId);

      const estimateNumber = await nextDocNumber(companyId, "EST", "estimates", "estimate_number");
      const { data: estimate, error: estimateError } = await supabase
        .from("estimates")
        .insert({
          company_id: companyId,
          estimate_number: estimateNumber,
          title: form.title.trim() || "HVAC Estimate",
          customer_id: customerId,
          property_id: propertyId,
          expires_at: form.expires_at || null,
          notes: form.disclaimer || null,
          subtotal: totals.subtotal,
          tax: totals.tax,
          total: totals.total,
          status: "draft",
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();
      if (estimateError || !estimate) throw estimateError ?? new Error("Could not create estimate");

      const optionRows = options.map((option, index) => ({
        company_id: companyId,
        estimate_id: estimate.id,
        tier: option.tier,
        name: option.name,
        description: option.description,
        sort_order: index,
        amount: totals.byOption[option.key] ?? 0,
        warranty_years: option.warranty_years,
        efficiency_rating: option.efficiency_rating,
        highlights: option.highlights.split("\n").map((h) => h.trim()).filter(Boolean),
        is_recommended: option.is_recommended,
        is_selected: false,
      }));
      const { data: createdOptions, error: optionError } = await supabase
        .from("estimate_options")
        .insert(optionRows)
        .select("id,sort_order");
      if (optionError) throw optionError;

      const optionIdByKey = new Map<OptionDraft["key"], string>();
      for (const row of createdOptions ?? []) {
        const key = options[Number(row.sort_order)]?.key;
        if (key) optionIdByKey.set(key, row.id);
      }

      if (lines.length > 0) {
        const lineRows = lines.map((line, index) => ({
          company_id: companyId,
          estimate_id: estimate.id,
          option_id: optionIdByKey.get(line.optionKey) ?? null,
          type: line.type,
          item_id: line.item_id,
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          total: line.quantity * line.unit_price,
          sort_order: index,
        }));
        const { error: lineError } = await supabase.from("estimate_line_items").insert(lineRows);
        if (lineError) throw lineError;
      }

      toast.success("Estimate created and saved");
      navigate({ to: "/estimates/$estimateId", params: { estimateId: estimate.id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create estimate";
      toast.error(message);
      console.error("estimate creation failed", error);
    } finally {
      setSaving(false);
    }
  };

  const activeLines = lines.filter((line) => line.optionKey === activeOption);

  return (
    <>
      <PageHeader
        title="New estimate"
        description="Build and save a complete proposal with linked customer, property, products, services, and terms."
        actions={<Button asChild variant="outline" size="sm"><Link to="/estimates">Cancel</Link></Button>}
      />
      <form onSubmit={onSubmit} className="grid gap-6 p-4 md:p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-primary" /> Estimate details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Estimate title" required className="md:col-span-2">
                <Input required value={form.title} onChange={(e) => set("title", e.target.value)} />
              </Field>
              <Field label="Expires on"><Input type="date" value={form.expires_at} onChange={(e) => set("expires_at", e.target.value)} /></Field>
              <Field label="Tax rate %"><Input type="number" min="0" step="0.01" value={form.tax_rate} onChange={(e) => set("tax_rate", e.target.value)} /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-base">
                <span className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-primary" /> Customer</span>
                <Segmented value={form.customer_mode} onChange={(value) => setForm((f) => ({ ...f, customer_mode: value as "existing" | "new", customer_id: value === "new" ? "" : f.customer_id }))} options={["existing", "new"]} />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {form.customer_mode === "existing" ? (
                <Field label="Existing customer" required className="md:col-span-2">
                  <Select value={form.customer_id} onValueChange={(value) => setForm((f) => ({ ...f, customer_id: value, property_id: "" }))}>
                    <SelectTrigger><SelectValue placeholder="Search/select customer…" /></SelectTrigger>
                    <SelectContent>
                      {customers.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No customers yet — switch to New.</div>}
                      {customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.name}{customer.phone ? ` • ${customer.phone}` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              ) : (
                <>
                  <Field label="Customer name" required><Input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} placeholder="Jane Doe or Acme Facilities" /></Field>
                  <Field label="Contact name"><Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} /></Field>
                  <Field label="Email"><Input type="email" value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} /></Field>
                  <Field label="Phone"><Input value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} /></Field>
                  <Field label="Customer type">
                    <Select value={form.customer_type} onValueChange={(value) => set("customer_type", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="residential">Residential</SelectItem><SelectItem value="commercial">Commercial</SelectItem></SelectContent>
                    </Select>
                  </Field>
                  <Field label="Billing address"><Input value={form.billing_address} onChange={(e) => set("billing_address", e.target.value)} /></Field>
                  <Field label="Customer notes" className="md:col-span-2"><Textarea rows={2} value={form.customer_notes} onChange={(e) => set("customer_notes", e.target.value)} /></Field>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-base">
                <span>Property / job site</span>
                <Segmented value={form.property_mode} onChange={(value) => setForm((f) => ({ ...f, property_mode: value as "none" | "existing" | "new", property_id: value === "existing" ? f.property_id : "" }))} options={["none", "existing", "new"]} />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {form.property_mode === "none" && <div className="md:col-span-2 text-sm text-muted-foreground">No property will be linked to this estimate.</div>}
              {form.property_mode === "existing" && (
                <Field label="Existing property" className="md:col-span-2">
                  <Select value={form.property_id} onValueChange={(value) => set("property_id", value)}>
                    <SelectTrigger><SelectValue placeholder="Select property…" /></SelectTrigger>
                    <SelectContent>
                      {filteredProperties.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No linked properties — switch to New.</div>}
                      {filteredProperties.map((property) => <SelectItem key={property.id} value={property.id}>{property.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              {form.property_mode === "new" && (
                <>
                  <Field label="Property name"><Input value={form.property_name} onChange={(e) => set("property_name", e.target.value)} placeholder="Main house, North office, Unit 2" /></Field>
                  <Field label="Property type"><Input value={form.property_type} onChange={(e) => set("property_type", e.target.value)} placeholder="single_family" /></Field>
                  <Field label="Service address" required className="md:col-span-2"><Input value={form.property_address} onChange={(e) => set("property_address", e.target.value)} /></Field>
                  <Field label="City"><Input value={form.property_city} onChange={(e) => set("property_city", e.target.value)} /></Field>
                  <Field label="State/region"><Input value={form.property_region} onChange={(e) => set("property_region", e.target.value)} /></Field>
                  <Field label="Postal code"><Input value={form.property_postal_code} onChange={(e) => set("property_postal_code", e.target.value)} /></Field>
                  <Field label="System count"><Input type="number" min="1" value={form.system_count} onChange={(e) => set("system_count", e.target.value)} /></Field>
                  <Field label="Access notes" className="md:col-span-2"><Textarea rows={2} value={form.access_notes} onChange={(e) => set("access_notes", e.target.value)} placeholder="Gate code, pets, preferred entry, parking, rooftop access…" /></Field>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Good / Better / Best options</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {options.map((option) => (
                  <button key={option.key} type="button" onClick={() => setActiveOption(option.key)} className={`rounded-lg border p-3 text-left transition ${activeOption === option.key ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/30"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={option.is_recommended ? "default" : "outline"} className="capitalize">{option.tier}</Badge>
                      <span className="text-sm font-semibold">${totals.byOption[option.key].toLocaleString()}</span>
                    </div>
                    <div className="mt-2 text-sm font-medium">{option.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{option.efficiency_rating} • {option.warranty_years} yr warranty</div>
                  </button>
                ))}
              </div>
              {options.map((option) => option.key === activeOption && (
                <div key={option.key} className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-2">
                  <Field label="Option name"><Input value={option.name} onChange={(e) => updateOption(option.key, { name: e.target.value })} /></Field>
                  <Field label="Tier"><Select value={option.tier} onValueChange={(value) => updateOption(option.key, { tier: value as OptionDraft["tier"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="good">Good</SelectItem><SelectItem value="better">Better</SelectItem><SelectItem value="best">Best</SelectItem></SelectContent></Select></Field>
                  <Field label="Warranty years"><Input type="number" min="0" value={option.warranty_years} onChange={(e) => updateOption(option.key, { warranty_years: Number(e.target.value) })} /></Field>
                  <Field label="Efficiency rating"><Input value={option.efficiency_rating} onChange={(e) => updateOption(option.key, { efficiency_rating: e.target.value })} /></Field>
                  <Field label="Description" className="md:col-span-2"><Textarea rows={2} value={option.description} onChange={(e) => updateOption(option.key, { description: e.target.value })} /></Field>
                  <Field label="Highlights" className="md:col-span-2"><Textarea rows={3} value={option.highlights} onChange={(e) => updateOption(option.key, { highlights: e.target.value })} /></Field>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={option.is_recommended} onChange={() => updateOption(option.key, { is_recommended: true })} /> Recommended pricing option</label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base">
                <span>Products, services, and line items</span>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => addManualLine("labor")}><Wrench className="mr-2 h-4 w-4" /> Labor</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => addManualLine("material")}><Package className="mr-2 h-4 w-4" /> Material</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => addManualLine("equipment")}><Plus className="mr-2 h-4 w-4" /> Equipment</Button>
                  <InventoryPicker items={inventory} onPick={addInventoryLine} />
                  <PriceBookPicker entries={priceBook} onPick={addPriceBookLine} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeLines.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No items in this option yet. Pull from price book, inventory, products/services, or add a custom line.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-3 py-2 text-left">Source</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Unit $</th><th className="px-3 py-2 text-right">Total</th><th /></tr></thead>
                    <tbody>
                      {activeLines.map((line) => (
                        <tr key={line.id} className="border-t border-border">
                          <td className="px-3 py-2 capitalize text-muted-foreground">{line.source}</td>
                          <td className="px-3 py-2 capitalize">{line.type}</td>
                          <td className="px-3 py-2"><Input className="h-8" value={line.description} onChange={(e) => updateLine(line.id, { description: e.target.value })} /></td>
                          <td className="px-3 py-2"><Input className="h-8 w-20 text-right" type="number" min="0" step="0.01" value={line.quantity} onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) })} /></td>
                          <td className="px-3 py-2"><Input className="h-8 w-24 text-right" type="number" min="0" step="0.01" value={line.unit_price} onChange={(e) => updateLine(line.id, { unit_price: Number(e.target.value) })} /></td>
                          <td className="px-3 py-2 text-right font-medium">${(line.quantity * line.unit_price).toLocaleString()}</td>
                          <td className="px-3 py-2 text-right"><Button type="button" size="sm" variant="ghost" onClick={() => removeLine(line.id)}><Trash2 className="h-4 w-4" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Disclaimers and terms</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={5} value={form.disclaimer} onChange={(e) => set("disclaimer", e.target.value)} />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Estimate summary</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {options.map((option) => (
                <div key={option.key} className="flex items-center justify-between gap-3">
                  <span className="capitalize text-muted-foreground">{option.tier}{option.is_recommended ? " total" : ""}</span>
                  <span className="font-medium">${totals.byOption[option.key].toLocaleString()}</span>
                </div>
              ))}
              <div className="h-px bg-border" />
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${totals.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${totals.tax.toLocaleString()}</span></div>
              <div className="flex justify-between text-base font-semibold"><span>Total</span><span>${totals.total.toLocaleString()}</span></div>
              <Button type="submit" className="mt-2 w-full" disabled={saving || !companyId} style={{ backgroundImage: "var(--gradient-primary)" }}>
                {saving ? "Saving estimate…" : "Create and save estimate"}<ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              {!companyId && <div className="text-xs text-muted-foreground">Workspace loading…</div>}
            </CardContent>
          </Card>
        </aside>
      </form>
    </>
  );
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return <div className={`space-y-1.5 ${className ?? ""}`}><Label>{label}{required && <span className="text-destructive"> *</span>}</Label>{children}</div>;
}

function Segmented({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => onChange(option)} className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition ${value === option ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{option}</button>
      ))}
    </div>
  );
}

function InventoryPicker({ items, onPick }: { items: InventoryItem[]; onPick: (id: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <Select value={value} onValueChange={(next) => { setValue(""); onPick(next); }}>
      <SelectTrigger className="h-9 w-[210px]"><SelectValue placeholder="Products/inventory…" /></SelectTrigger>
      <SelectContent className="max-h-[360px]">
        {items.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No active products yet</div>}
        {items.map((item) => <SelectItem key={item.id} value={item.id}>{item.sku} — {item.name} (${Number(item.unit_price).toLocaleString()})</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function PriceBookPicker({ entries, onPick }: { entries: PriceEntry[]; onPick: (key: string) => void }) {
  const [value, setValue] = useState("");
  const activeEntries = entries.filter((entry) => entry.item.active);
  return (
    <Select value={value} onValueChange={(next) => { setValue(""); onPick(next); }}>
      <SelectTrigger className="h-9 w-[210px]"><SelectValue placeholder="Price book…" /></SelectTrigger>
      <SelectContent className="max-h-[360px]">
        {activeEntries.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No price book items</div>}
        {activeEntries.map((entry) => <SelectItem key={`${entry.kind}::${entry.item.code}`} value={`${entry.kind}::${entry.item.code}`}>{entry.kind === "services" ? "Service" : "Product"} • {entry.item.code} — {entry.item.name} (${Number(entry.item.price).toLocaleString()})</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
