import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { nextEstimateNumber } from "@/lib/estimates-api";

export const Route = createFileRoute("/estimates/new")({ component: NewEstimate });

type Opt = { id: string; label: string };

function NewEstimate() {
  const navigate = useNavigate();
  const { companyId, user } = useAuth();
  const [customers, setCustomers] = useState<Opt[]>([]);
  const [properties, setProperties] = useState<Opt[]>([]);
  const [jobs, setJobs] = useState<Opt[]>([]);
  const [equipment, setEquipment] = useState<Opt[]>([]);
  const [form, setForm] = useState({
    title: "HVAC System Replacement Proposal",
    customer_id: "",
    property_id: "",
    job_id: "",
    equipment_id: "",
    expires_at: "",
    seedTiers: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: p }, { data: j }, { data: e }] = await Promise.all([
        supabase.from("customers").select("id,name").order("name"),
        supabase.from("properties").select("id,name,address").order("created_at", { ascending: false }),
        supabase.from("jobs").select("id,job_number,title").order("created_at", { ascending: false }).limit(100),
        supabase.from("equipment").select("id,brand,model,type").order("created_at", { ascending: false }).limit(100),
      ]);
      setCustomers((c ?? []).map((x) => ({ id: x.id, label: x.name })));
      setProperties((p ?? []).map((x) => ({ id: x.id, label: x.name ? `${x.name} — ${x.address}` : x.address })));
      setJobs((j ?? []).map((x) => ({ id: x.id, label: `${x.job_number} • ${x.title}` })));
      setEquipment((e ?? []).map((x) => ({ id: x.id, label: `${x.type}${x.brand ? " — " + x.brand : ""}${x.model ? " " + x.model : ""}` })));
    })();
  }, []);

  const filteredProps = form.customer_id
    ? properties // already loaded; could filter by customer if needed
    : properties;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return toast.error("Missing company");
    if (!form.customer_id) return toast.error("Pick a customer");
    setSaving(true);
    const number = nextEstimateNumber();
    const { data: est, error } = await supabase
      .from("estimates")
      .insert({
        company_id: companyId,
        estimate_number: number,
        title: form.title,
        customer_id: form.customer_id,
        property_id: form.property_id || null,
        job_id: form.job_id || null,
        equipment_id: form.equipment_id || null,
        expires_at: form.expires_at || null,
        status: "draft",
        created_by: user?.id ?? null,
      })
      .select("id")
      .single();
    if (error || !est) {
      setSaving(false);
      return toast.error(error?.message ?? "Failed");
    }
    if (form.seedTiers) {
      await supabase.from("estimate_options").insert([
        { company_id: companyId, estimate_id: est.id, tier: "good", name: "Good — Reliable Comfort", description: "Builder-grade equipment with our standard install.", sort_order: 0, amount: 0, warranty_years: 5, efficiency_rating: "14 SEER2", highlights: ["Standard 14 SEER2 system", "5-yr parts warranty", "1-yr labor warranty"], is_recommended: false },
        { company_id: companyId, estimate_id: est.id, tier: "better", name: "Better — Smart Efficiency", description: "Higher efficiency, smart thermostat included.", sort_order: 1, amount: 0, warranty_years: 10, efficiency_rating: "16 SEER2", highlights: ["16 SEER2 two-stage system", "Smart Wi-Fi thermostat", "10-yr parts warranty", "2-yr labor warranty"], is_recommended: true },
        { company_id: companyId, estimate_id: est.id, tier: "best", name: "Best — Premium Comfort", description: "Top-tier variable speed system with whole-home filtration.", sort_order: 2, amount: 0, warranty_years: 12, efficiency_rating: "20 SEER2", highlights: ["20+ SEER2 variable speed", "Premium air purification", "12-yr parts + 5-yr labor", "Lowest monthly utility bills"], is_recommended: false },
      ]);
    }
    toast.success("Estimate created");
    navigate({ to: "/estimates/$estimateId", params: { estimateId: est.id } });
  };

  return (
    <>
      <PageHeader
        title="New estimate"
        description="Start a proposal for a customer."
        actions={<Link to="/estimates"><Button variant="outline" size="sm">Cancel</Button></Link>}
      />
      <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-4 p-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Proposal details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Title" className="md:col-span-2">
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Customer" required>
              <Picker value={form.customer_id} onChange={(v) => setForm({ ...form, customer_id: v })} options={customers} placeholder="Select customer" />
            </Field>
            <Field label="Property">
              <Picker value={form.property_id} onChange={(v) => setForm({ ...form, property_id: v })} options={filteredProps} placeholder="Optional" />
            </Field>
            <Field label="Linked job">
              <Picker value={form.job_id} onChange={(v) => setForm({ ...form, job_id: v })} options={jobs} placeholder="Optional" />
            </Field>
            <Field label="Equipment">
              <Picker value={form.equipment_id} onChange={(v) => setForm({ ...form, equipment_id: v })} options={equipment} placeholder="Optional" />
            </Field>
            <Field label="Expires on">
              <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </Field>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-medium">Pre-fill Good / Better / Best tiers</div>
              <div className="text-xs text-muted-foreground">Recommended for replacement proposals.</div>
            </div>
            <input type="checkbox" className="h-4 w-4" checked={form.seedTiers} onChange={(e) => setForm({ ...form, seedTiers: e.target.checked })} />
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>
            {saving ? "Creating…" : "Create estimate"}
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

function Picker({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: Opt[]; placeholder?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={placeholder ?? "Select…"} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}