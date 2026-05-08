import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Star, Shield, Zap, ThumbsUp, PenLine, ArrowRight, Sparkles } from "lucide-react";
import {
  fetchEstimate,
  TIER_THEME,
  estimateMonthly,
  type EstimateLineItem,
  type EstimateOption,
  type EstimatePhoto,
  type EstimateRow,
} from "@/lib/estimates-api";

export const Route = createFileRoute("/estimates/$estimateId/proposal")({ component: ProposalPage });

function ProposalPage() {
  const { estimateId } = Route.useParams();
  const [est, setEst] = useState<EstimateRow | null>(null);
  const [opts, setOpts] = useState<EstimateOption[]>([]);
  const [lines, setLines] = useState<EstimateLineItem[]>([]);
  const [photos, setPhotos] = useState<EstimatePhoto[]>([]);
  const [customer, setCustomer] = useState<{ name: string; email: string | null; phone: string | null } | null>(null);
  const [companyName, setCompanyName] = useState<string>("Servex HVAC");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signerName, setSignerName] = useState("");

  const reload = async () => {
    const r = await fetchEstimate(estimateId);
    setEst(r.estimate);
    setOpts(r.options);
    setLines(r.lineItems);
    setPhotos(r.photos);
    if (!selectedId) {
      const rec = r.options.find((o) => o.is_recommended) ?? r.options[1] ?? r.options[0];
      setSelectedId(rec?.id ?? null);
    }
    if (r.estimate?.customer_id) {
      const { data } = await supabase.from("customers").select("name,email,phone,company_id").eq("id", r.estimate.customer_id).maybeSingle();
      if (data) {
        setCustomer({ name: data.name, email: data.email, phone: data.phone });
        if (data.company_id) {
          const { data: c } = await supabase.from("companies").select("name").eq("id", data.company_id).maybeSingle();
          if (c?.name) setCompanyName(c.name);
        }
      }
    }
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [estimateId]);

  if (!est) return <div className="p-10 text-sm text-muted-foreground">Loading proposal…</div>;

  const selected = opts.find((o) => o.id === selectedId) ?? opts[0];
  const totalsByOption: Record<string, number> = {};
  for (const l of lines) {
    const k = l.option_id ?? "_";
    totalsByOption[k] = (totalsByOption[k] ?? 0) + Number(l.total || l.quantity * l.unit_price);
  }

  const approve = async () => {
    if (!selected) return;
    if (!signerName.trim()) return toast.error("Please type your name to sign");
    setSigning(true);
    await supabase.from("estimate_options").update({ is_selected: false }).eq("estimate_id", est.id);
    await supabase.from("estimate_options").update({ is_selected: true }).eq("id", selected.id);
    const subtotal = totalsByOption[selected.id] ?? 0;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + tax;
    await supabase.from("estimates").update({
      status: "approved",
      approved_at: new Date().toISOString(),
      signed_at: new Date().toISOString(),
      signed_by_name: signerName.trim(),
      signature_data: signerName.trim(),
      subtotal,
      tax,
      total,
    }).eq("id", est.id);
    setSigning(false);
    toast.success("Proposal approved — thank you!");
    reload();
  };

  const isApproved = est.status === "approved" || est.status === "converted";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{companyName}</div>
            <div className="text-lg font-semibold">{est.title}</div>
          </div>
          <div className="text-right text-sm">
            <div className="font-mono text-xs text-muted-foreground">{est.estimate_number}</div>
            {est.expires_at && <div className="text-xs text-muted-foreground">Valid through {est.expires_at}</div>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-10 px-6 py-10">
        {/* Hero */}
        <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <Badge className="mb-3 bg-primary/10 text-primary">Prepared for {customer?.name ?? "Customer"}</Badge>
              <h1 className="text-3xl font-semibold tracking-tight">Your new comfort system, three ways.</h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                We've put together three options so you can choose the level of efficiency, comfort, and warranty that's right for your home or business.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isApproved ? (
                <Badge className="bg-[oklch(0.65_0.16_150)/0.18] text-[oklch(0.35_0.16_150)] border-transparent">
                  <Check className="mr-1 h-3 w-3" /> Approved {est.signed_by_name ? `by ${est.signed_by_name}` : ""}
                </Badge>
              ) : (
                <Badge className="bg-primary/10 text-primary border-transparent">Awaiting your approval</Badge>
              )}
            </div>
          </div>
        </section>

        {/* Tier cards */}
        <section className="grid gap-5 md:grid-cols-3">
          {opts.map((o) => {
            const tier = (o.tier ?? "good") as "good" | "better" | "best";
            const theme = TIER_THEME[tier];
            const total = totalsByOption[o.id] ?? 0;
            const isSel = o.id === selectedId;
            return (
              <Card
                key={o.id}
                className={`relative flex flex-col overflow-hidden border-2 p-0 transition ${isSel ? "border-primary shadow-lg shadow-primary/10" : "border-border"} ${o.is_recommended ? "md:scale-[1.03]" : ""}`}
              >
                {o.is_recommended && (
                  <div className="absolute right-0 top-0 rounded-bl-md bg-[oklch(0.78_0.18_85)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[oklch(0.25_0.05_85)]">
                    Most popular
                  </div>
                )}
                <div className={`h-1.5 w-full ${theme.bar}`} />
                <div className="flex flex-1 flex-col p-6">
                  <span className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${theme.chip}`}>{theme.label}</span>
                  <div className="mt-3 text-lg font-semibold">{o.name}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>

                  <div className="mt-5">
                    <div className="text-3xl font-bold">${total.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      or <span className="font-semibold text-primary">${estimateMonthly(total).toLocaleString()}/mo</span> for 84 mo
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                    <Spec icon={<Shield className="h-3.5 w-3.5" />} label="Warranty" value={`${o.warranty_years ?? 0} yrs`} />
                    <Spec icon={<Zap className="h-3.5 w-3.5" />} label="Efficiency" value={o.efficiency_rating ?? "—"} />
                  </div>

                  <ul className="mt-5 flex-1 space-y-2 text-sm">
                    {(o.highlights ?? []).map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-none text-[oklch(0.55_0.16_150)]" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-6 w-full"
                    variant={isSel ? "default" : "outline"}
                    onClick={() => setSelectedId(o.id)}
                    disabled={isApproved}
                    style={isSel ? { backgroundImage: "var(--gradient-primary)" } : undefined}
                  >
                    {isSel ? <><Star className="mr-2 h-4 w-4" /> Selected</> : "Choose this option"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>

        {/* Why it matters */}
        <section className="grid gap-4 sm:grid-cols-3">
          <InfoCard icon={<Shield className="h-5 w-5 text-primary" />} title="Manufacturer-backed warranty"
            body="Every system is registered with the manufacturer for full parts coverage. Higher tiers add labor coverage so future repairs are protected." />
          <InfoCard icon={<Zap className="h-5 w-5 text-primary" />} title="Lower energy bills"
            body="A 16+ SEER2 system can cut cooling costs by up to 30% compared to old 10 SEER equipment. Variable-speed Best tier saves the most year-round." />
          <InfoCard icon={<Sparkles className="h-5 w-5 text-primary" />} title="Cleaner indoor air"
            body="Better and Best tiers add advanced filtration to reduce dust, allergens, and odors in your living spaces." />
        </section>

        {/* Photos */}
        {photos.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Site photos</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photos.map((p) => (
                <figure key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
                  <img src={p.url} alt={p.caption ?? ""} className="aspect-square w-full object-cover" />
                  {p.caption && <figcaption className="px-2 py-1 text-[11px] text-muted-foreground">{p.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Selected detail + scope */}
        {selected && (
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Your selection</div>
                <div className="mt-1 text-lg font-semibold">{selected.name}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${(totalsByOption[selected.id] ?? 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">~${estimateMonthly(totalsByOption[selected.id] ?? 0).toLocaleString()}/mo</div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Total</th></tr>
                </thead>
                <tbody>
                  {lines.filter((l) => l.option_id === selected.id).map((l) => (
                    <tr key={l.id} className="border-t border-border">
                      <td className="px-3 py-2">{l.description}</td>
                      <td className="px-3 py-2 text-right">{Number(l.quantity)}</td>
                      <td className="px-3 py-2 text-right">${(Number(l.quantity) * Number(l.unit_price)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Approval */}
        <section className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-8">
          {isApproved ? (
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-[oklch(0.65_0.16_150)/0.15] p-3"><ThumbsUp className="h-6 w-6 text-[oklch(0.45_0.16_150)]" /></div>
              <h3 className="mt-3 text-xl font-semibold">Approved — we'll be in touch shortly.</h3>
              <p className="mt-1 text-sm text-muted-foreground">Signed by {est.signed_by_name} on {est.signed_at?.slice(0, 10)}.</p>
              <SignatureBlock name={est.signed_by_name ?? ""} />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <PenLine className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Approve this proposal</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">By typing your name below you authorize {companyName} to proceed with the selected option.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Type your full name</label>
                  <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder={customer?.name ?? "Your name"} className="mt-1" />
                </div>
                <Button onClick={approve} disabled={signing || !selected} size="lg" style={{ backgroundImage: "var(--gradient-primary)" }}>
                  Approve & sign <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              {signerName && <SignatureBlock name={signerName} preview />}
            </div>
          )}
        </section>

        <div className="flex justify-between pb-10 text-xs text-muted-foreground">
          <span>Questions? Reply to the email this proposal came from.</span>
          <Link to="/estimates" className="hover:text-foreground">← Back to estimates</Link>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">{icon} {label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">{icon}<div className="text-sm font-semibold">{title}</div></div>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function SignatureBlock({ name, preview }: { name: string; preview?: boolean }) {
  return (
    <div className={`mx-auto mt-4 w-full max-w-md rounded-md border ${preview ? "border-dashed border-border" : "border-border bg-card"} p-4 text-center`}>
      <div style={{ fontFamily: "'Brush Script MT', cursive", fontSize: 36 }} className="text-foreground">{name}</div>
      <div className="mt-1 border-t border-border pt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
        {preview ? "Signature preview" : "Signed electronically"}
      </div>
    </div>
  );
}

