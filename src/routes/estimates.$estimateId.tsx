import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Image as ImageIcon, ExternalLink, FileCheck, Wrench, Package, Cog, Sparkles, Star, ArrowRight, Send } from "lucide-react";
import {
  fetchEstimate,
  STATUS_LABEL,
  STATUS_TONE,
  TIER_THEME,
  estimateMonthly,
  type EstimateLineItem,
  type EstimateOption,
  type EstimatePhoto,
  type EstimateRow,
} from "@/lib/estimates-api";
import { useAllPriceBook } from "@/lib/price-book-store";

export const Route = createFileRoute("/estimates/$estimateId")({ component: BuilderPage });

type InvItem = { id: string; sku: string; name: string; unit_price: number };

function BuilderPage() {
  const { estimateId } = Route.useParams();
  const { companyId, user } = useAuth();
  const navigate = useNavigate();
  const [est, setEst] = useState<EstimateRow | null>(null);
  const [opts, setOpts] = useState<EstimateOption[]>([]);
  const [lines, setLines] = useState<EstimateLineItem[]>([]);
  const [photos, setPhotos] = useState<EstimatePhoto[]>([]);
  const [inventory, setInventory] = useState<InvItem[]>([]);
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const priceBook = useAllPriceBook();

  const reload = async () => {
    const r = await fetchEstimate(estimateId);
    setEst(r.estimate);
    setOpts(r.options);
    setLines(r.lineItems);
    setPhotos(r.photos);
    if (!activeOptionId && r.options[0]) setActiveOptionId(r.options[0].id);
  };

  useEffect(() => {
    reload();
    supabase.from("inventory_items").select("id,sku,name,unit_price").eq("status", "active").limit(500).then(({ data }) => {
      setInventory((data ?? []) as InvItem[]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimateId]);

  const totalsByOption = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of lines) {
      const k = l.option_id ?? "_none";
      map[k] = (map[k] ?? 0) + Number(l.total || l.quantity * l.unit_price);
    }
    return map;
  }, [lines]);

  const persistOptionAmount = async (optionId: string, amount: number) => {
    await supabase.from("estimate_options").update({ amount }).eq("id", optionId);
  };

  const persistEstimateTotals = async () => {
    if (!est) return;
    const selected = opts.find((o) => o.is_selected) ?? opts.find((o) => o.is_recommended) ?? opts[0];
    const subtotal = selected ? totalsByOption[selected.id] ?? 0 : 0;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + tax;
    await supabase.from("estimates").update({ subtotal, tax, total }).eq("id", est.id);
  };

  useEffect(() => {
    if (!est || !opts.length) return;
    // recalc each option amount
    opts.forEach((o) => {
      const amt = totalsByOption[o.id] ?? 0;
      if (Number(o.amount) !== amt) persistOptionAmount(o.id, amt);
    });
    persistEstimateTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  if (!est) return <div className="p-8 text-sm text-muted-foreground">Loading estimate…</div>;

  const addLine = async (type: EstimateLineItem["type"]) => {
    if (!companyId || !activeOptionId) return;
    const { error } = await supabase.from("estimate_line_items").insert({
      company_id: companyId,
      estimate_id: est.id,
      option_id: activeOptionId,
      type,
      description: type === "labor" ? "Labor" : type === "equipment" ? "Equipment" : "Material",
      quantity: 1,
      unit_price: 0,
      total: 0,
      sort_order: lines.length,
    });
    if (error) return toast.error(error.message);
    reload();
  };

  const addFromInventory = async (itemId: string) => {
    if (!companyId || !activeOptionId) return;
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    const { error } = await supabase.from("estimate_line_items").insert({
      company_id: companyId,
      estimate_id: est.id,
      option_id: activeOptionId,
      type: "material",
      item_id: item.id,
      description: `${item.sku} — ${item.name}`,
      quantity: 1,
      unit_price: item.unit_price,
      total: item.unit_price,
      sort_order: lines.length,
    });
    if (error) return toast.error(error.message);
    reload();
  };

  const addFromPriceBook = async (codeKey: string) => {
    if (!companyId || !activeOptionId) return;
    const [kind, code] = codeKey.split("::");
    const entry = priceBook.find((p) => p.kind === kind && p.item.code === code);
    if (!entry) return;
    const it = entry.item;
    const lineType: EstimateLineItem["type"] =
      entry.kind === "services" ? "labor" : "equipment";
    const { error } = await supabase.from("estimate_line_items").insert({
      company_id: companyId,
      estimate_id: est.id,
      option_id: activeOptionId,
      type: lineType,
      description: `${it.code} — ${it.name}`,
      quantity: 1,
      unit_price: it.price,
      total: it.price,
      sort_order: lines.length,
    });
    if (error) return toast.error(error.message);
    toast.success(`Added "${it.name}" from price book`);
    reload();
  };

  const updateLine = async (id: string, patch: Partial<EstimateLineItem>) => {
    const cur = lines.find((l) => l.id === id);
    if (!cur) return;
    const next = { ...cur, ...patch };
    next.total = Number(next.quantity) * Number(next.unit_price);
    setLines((ls) => ls.map((l) => (l.id === id ? next : l)));
    await supabase.from("estimate_line_items").update({
      description: next.description,
      quantity: next.quantity,
      unit_price: next.unit_price,
      total: next.total,
    }).eq("id", id);
  };

  const removeLine = async (id: string) => {
    await supabase.from("estimate_line_items").delete().eq("id", id);
    reload();
  };

  const updateOption = async (id: string, patch: Partial<EstimateOption>) => {
    setOpts((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    await supabase.from("estimate_options").update(patch).eq("id", id);
  };

  const setRecommended = async (id: string) => {
    for (const o of opts) {
      await supabase.from("estimate_options").update({ is_recommended: o.id === id }).eq("id", o.id);
    }
    reload();
  };

  const addPhoto = async () => {
    const url = window.prompt("Image URL");
    if (!url || !companyId) return;
    const caption = window.prompt("Caption (optional)") ?? null;
    await supabase.from("estimate_photos").insert({
      company_id: companyId,
      estimate_id: est.id,
      url,
      caption,
      created_by: user?.id ?? null,
    });
    reload();
  };

  const removePhoto = async (id: string) => {
    await supabase.from("estimate_photos").delete().eq("id", id);
    reload();
  };

  const sendToCustomer = async () => {
    setBusy(true);
    await supabase.from("estimates").update({ status: "sent" }).eq("id", est.id);
    setBusy(false);
    toast.success("Marked as sent — share the proposal link with your customer.");
    reload();
  };

  const setStatus = async (status: EstimateRow["status"]) => {
    setBusy(true);
    const patch: Partial<EstimateRow> = { status };
    if (status === "approved") patch.approved_at = new Date().toISOString();
    const { error } = await supabase.from("estimates").update(patch).eq("id", est.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Estimate ${status}`);
    reload();
  };

  const convertToJob = async () => {
    if (!companyId) return;
    setBusy(true);
    const jobNumber = `JOB-${Date.now().toString().slice(-6)}`;
    const { data: job, error } = await supabase.from("jobs").insert({
      company_id: companyId,
      job_number: jobNumber,
      title: est.title,
      customer_id: est.customer_id,
      property_id: est.property_id,
      equipment_id: est.equipment_id,
      status: "scheduled",
      priority: "medium",
      total_value: Number(est.total),
      created_by: user?.id ?? null,
    }).select("id").single();
    setBusy(false);
    if (error || !job) return toast.error(error?.message ?? "Failed");
    await supabase.from("estimates").update({ job_id: job.id, status: "converted" }).eq("id", est.id);
    toast.success("Job created from estimate");
    navigate({ to: "/jobs" });
  };

  const convertToInvoice = async () => {
    if (!companyId) return;
    setBusy(true);
    const invNumber = `INV-${Date.now().toString().slice(-6)}`;
    // Use the selected/recommended option's lines if available
    const selectedOpt = opts.find((o) => o.is_selected) ?? opts.find((o) => o.is_recommended) ?? opts[0] ?? null;
    const carryLines = selectedOpt
      ? lines.filter((l) => l.option_id === selectedOpt.id)
      : lines;
    const subtotal = carryLines.reduce((s, l) => s + Number(l.total || l.quantity * l.unit_price), 0) || Number(est.subtotal);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + tax;
    const { data: inv, error } = await supabase.from("invoices").insert({
      company_id: companyId,
      invoice_number: invNumber,
      customer_id: est.customer_id,
      job_id: est.job_id,
      estimate_id: est.id,
      subtotal,
      tax,
      total,
      balance_due: total,
      status: "draft",
      created_by: user?.id ?? null,
    }).select("id").single();
    if (error || !inv) { setBusy(false); return toast.error(error?.message ?? "Could not create invoice"); }
    if (carryLines.length > 0) {
      const rows = carryLines.map((l, i) => ({
        company_id: companyId,
        invoice_id: inv.id,
        item_id: l.item_id,
        description: l.description,
        type: l.type === "labor" ? "service" : l.type,
        quantity: l.quantity,
        unit_price: l.unit_price,
        total: Number(l.total || l.quantity * l.unit_price),
        sort_order: i,
      }));
      const { error: liErr } = await supabase.from("invoice_line_items").insert(rows);
      if (liErr) { setBusy(false); return toast.error(`Invoice created, but line items failed: ${liErr.message}`); }
    }
    setBusy(false);
    await supabase.from("estimates").update({ status: "converted" }).eq("id", est.id);
    toast.success("Invoice created with line items");
    navigate({ to: "/invoices" });
  };

  const activeLines = lines.filter((l) => l.option_id === activeOptionId);
  const activeOpt = opts.find((o) => o.id === activeOptionId);

  return (
    <>
      <PageHeader
        title={est.title}
        description={`${est.estimate_number} • ${STATUS_LABEL[est.status]}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${STATUS_TONE[est.status]} border-transparent`}>{STATUS_LABEL[est.status]}</Badge>
            <Button asChild variant="outline" size="sm">
              <Link to="/estimates/$estimateId/proposal" params={{ estimateId: est.id }}><ExternalLink className="mr-2 h-4 w-4" /> Customer view</Link>
            </Button>
            <Button size="sm" variant="outline" onClick={sendToCustomer} disabled={busy}><Send className="mr-2 h-4 w-4" /> Mark sent</Button>
            <Button size="sm" variant="outline" onClick={() => setStatus("approved")} disabled={busy}>Approve</Button>
            <Button size="sm" variant="outline" onClick={() => setStatus("rejected")} disabled={busy}>Reject</Button>
            <Button size="sm" variant="outline" onClick={convertToJob} disabled={busy}>Convert to job</Button>
            <Button size="sm" onClick={convertToInvoice} disabled={busy} style={{ backgroundImage: "var(--gradient-primary)" }}>
              <FileCheck className="mr-2 h-4 w-4" /> Convert to invoice
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Tier tabs */}
          <div className="grid gap-3 sm:grid-cols-3">
            {opts.map((o) => {
              const tier = (o.tier ?? "good") as "good" | "better" | "best";
              const theme = TIER_THEME[tier];
              const active = o.id === activeOptionId;
              const total = totalsByOption[o.id] ?? 0;
              return (
                <button
                  key={o.id}
                  onClick={() => setActiveOptionId(o.id)}
                  className={`group rounded-xl border-2 bg-card p-4 text-left transition ${active ? "ring-2 ring-primary " + theme.ring : theme.ring} hover:border-primary/40`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${theme.chip}`}>{theme.label}</span>
                    {o.is_recommended && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[oklch(0.55_0.16_50)]"><Star className="h-3 w-3 fill-current" /> Recommended</span>
                    )}
                  </div>
                  <div className="mt-2 text-sm font-semibold">{o.name}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{o.description}</div>
                  <div className="mt-3 text-2xl font-bold">${total.toLocaleString()}</div>
                  <div className="text-[11px] text-muted-foreground">~${estimateMonthly(total).toLocaleString()}/mo financing</div>
                </button>
              );
            })}
          </div>

          {/* Active option detail */}
          {activeOpt && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Editing: {activeOpt.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">Adjust pricing, warranty, efficiency, and selling points.</p>
                </div>
                <Button size="sm" variant={activeOpt.is_recommended ? "default" : "outline"} onClick={() => setRecommended(activeOpt.id)}>
                  <Star className="mr-2 h-4 w-4" /> {activeOpt.is_recommended ? "Recommended" : "Mark recommended"}
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label="Tier name"><Input value={activeOpt.name} onChange={(e) => updateOption(activeOpt.id, { name: e.target.value })} /></Field>
                <Field label="Tier label">
                  <Select value={activeOpt.tier ?? "good"} onValueChange={(v) => updateOption(activeOpt.id, { tier: v as EstimateOption["tier"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="better">Better</SelectItem>
                      <SelectItem value="best">Best</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Warranty (years)"><Input type="number" min="0" value={activeOpt.warranty_years ?? 0} onChange={(e) => updateOption(activeOpt.id, { warranty_years: Number(e.target.value) })} /></Field>
                <Field label="Efficiency rating"><Input value={activeOpt.efficiency_rating ?? ""} onChange={(e) => updateOption(activeOpt.id, { efficiency_rating: e.target.value })} placeholder="e.g. 18 SEER2" /></Field>
                <Field label="Description" className="md:col-span-2"><Textarea rows={2} value={activeOpt.description ?? ""} onChange={(e) => updateOption(activeOpt.id, { description: e.target.value })} /></Field>
                <Field label="Highlights (one per line)" className="md:col-span-2">
                  <Textarea rows={3} value={(activeOpt.highlights ?? []).join("\n")} onChange={(e) => updateOption(activeOpt.id, { highlights: e.target.value.split("\n").filter(Boolean) })} />
                </Field>
              </CardContent>
            </Card>
          )}

          {/* Line items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Line items</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => addLine("labor")}><Wrench className="mr-2 h-4 w-4" /> Labor</Button>
                <Button size="sm" variant="outline" onClick={() => addLine("material")}><Package className="mr-2 h-4 w-4" /> Material</Button>
                <Button size="sm" variant="outline" onClick={() => addLine("equipment")}><Cog className="mr-2 h-4 w-4" /> Equipment</Button>
                <InventoryPicker items={inventory} onPick={addFromInventory} />
                <PriceBookPicker entries={priceBook} onPick={addFromPriceBook} />
              </div>
            </CardHeader>
            <CardContent>
              {activeLines.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No items in this tier yet. Add labor, materials, or equipment.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Unit $</th>
                        <th className="px-3 py-2 text-right">Total</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {activeLines.map((l) => (
                        <tr key={l.id} className="border-t border-border">
                          <td className="px-3 py-2"><TypeBadge type={l.type} /></td>
                          <td className="px-3 py-2"><Input value={l.description} onChange={(e) => updateLine(l.id, { description: e.target.value })} className="h-8" /></td>
                          <td className="px-3 py-2"><Input type="number" min="0" step="0.01" value={l.quantity} onChange={(e) => updateLine(l.id, { quantity: Number(e.target.value) })} className="h-8 w-20 text-right" /></td>
                          <td className="px-3 py-2"><Input type="number" min="0" step="0.01" value={l.unit_price} onChange={(e) => updateLine(l.id, { unit_price: Number(e.target.value) })} className="h-8 w-24 text-right" /></td>
                          <td className="px-3 py-2 text-right font-medium">${(Number(l.quantity) * Number(l.unit_price)).toLocaleString()}</td>
                          <td className="px-3 py-2 text-right"><Button size="sm" variant="ghost" onClick={() => removeLine(l.id)}><Trash2 className="h-4 w-4" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Photos</CardTitle>
              <Button size="sm" variant="outline" onClick={addPhoto}><Plus className="mr-2 h-4 w-4" /> Add photo URL</Button>
            </CardHeader>
            <CardContent>
              {photos.length === 0 ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground"><ImageIcon className="h-4 w-4" /> No photos attached.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {photos.map((p) => (
                    <div key={p.id} className="group relative overflow-x-auto rounded-md border border-border">
                      <img src={p.url} alt={p.caption ?? ""} className="aspect-square w-full object-cover" />
                      <button onClick={() => removePhoto(p.id)} className="absolute right-1 top-1 rounded bg-background/80 p-1 opacity-0 transition group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                      {p.caption && <div className="truncate bg-card px-2 py-1 text-[11px]">{p.caption}</div>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader><CardTitle className="text-base">Internal notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                placeholder="Notes for your team — not shown to customer."
                defaultValue={est.notes ?? ""}
                onBlur={(e) => supabase.from("estimates").update({ notes: e.target.value }).eq("id", est.id)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right rail summary */}
        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {opts.map((o) => {
                const t = totalsByOption[o.id] ?? 0;
                return (
                  <div key={o.id} className="flex items-center justify-between">
                    <span className="capitalize text-muted-foreground">{o.tier ?? "tier"}</span>
                    <span className="font-medium">${t.toLocaleString()}</span>
                  </div>
                );
              })}
              <div className="my-2 h-px bg-border" />
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Subtotal</span><span>${Number(est.subtotal).toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Tax</span><span>${Number(est.tax).toLocaleString()}</span></div>
              <div className="flex items-center justify-between text-base font-semibold"><span>Total</span><span>${Number(est.total).toLocaleString()}</span></div>
              <div className="mt-2 rounded-md bg-primary/5 p-3 text-xs">
                <div className="font-semibold text-primary">As low as ${estimateMonthly(Number(est.total)).toLocaleString()}/mo</div>
                <div className="text-muted-foreground">84-mo financing, 9.99% APR (placeholder)</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Energy efficiency</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>Higher SEER2 systems use 20–40% less electricity than older 10 SEER units, paying back the upfront cost over time.</p>
              <p>Recommend at least 16 SEER2 for replacements to qualify for many utility rebates.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Next steps</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Button asChild className="w-full" variant="outline">
                <Link to="/estimates/$estimateId/proposal" params={{ estimateId: est.id }}><ExternalLink className="mr-2 h-4 w-4" /> Open customer proposal</Link>
              </Button>
              <Button className="w-full" onClick={convertToInvoice} disabled={busy} style={{ backgroundImage: "var(--gradient-primary)" }}>
                Convert to invoice <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
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

function TypeBadge({ type }: { type: EstimateLineItem["type"] }) {
  const map = {
    labor: { c: "bg-primary/10 text-primary", i: <Wrench className="h-3 w-3" /> },
    material: { c: "bg-muted text-foreground", i: <Package className="h-3 w-3" /> },
    equipment: { c: "bg-[oklch(0.78_0.18_85)/0.2] text-[oklch(0.4_0.16_85)]", i: <Cog className="h-3 w-3" /> },
  } as const;
  const t = map[type];
  return <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium capitalize ${t.c}`}>{t.i} {type}</span>;
}

function InventoryPicker({ items, onPick }: { items: InvItem[]; onPick: (id: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Select value={v} onValueChange={(val) => { setV(""); onPick(val); }}>
        <SelectTrigger className="h-9 w-[220px]"><SelectValue placeholder="From inventory…" /></SelectTrigger>
        <SelectContent>
          {items.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No inventory items</div>}
          {items.map((i) => <SelectItem key={i.id} value={i.id}>{i.sku} — {i.name} (${i.unit_price})</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

type PriceEntry = ReturnType<typeof useAllPriceBook>[number];

function PriceBookPicker({ entries, onPick }: { entries: PriceEntry[]; onPick: (key: string) => void }) {
  const [v, setV] = useState("");
  const sales = entries.filter((e) => e.kind === "sales" && e.item.active);
  const services = entries.filter((e) => e.kind === "services" && e.item.active);
  return (
    <Select value={v} onValueChange={(val) => { setV(""); onPick(val); }}>
      <SelectTrigger className="h-9 w-[240px]"><SelectValue placeholder="From price book…" /></SelectTrigger>
      <SelectContent className="max-h-[360px]">
        {sales.length > 0 && (
          <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sales</div>
        )}
        {sales.map((e) => (
          <SelectItem key={`sales::${e.item.code}`} value={`sales::${e.item.code}`}>
            {e.item.code} — {e.item.name} (${e.item.price})
          </SelectItem>
        ))}
        {services.length > 0 && (
          <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Services</div>
        )}
        {services.map((e) => (
          <SelectItem key={`services::${e.item.code}`} value={`services::${e.item.code}`}>
            {e.item.code} — {e.item.name} (${e.item.price})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}