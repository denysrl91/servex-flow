import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

type CompanyForm = {
  name: string; email: string; phone: string; website: string;
  address: string; city: string; region: string; postal_code: string; country: string;
};

const EMPTY: CompanyForm = { name: "", email: "", phone: "", website: "", address: "", city: "", region: "", postal_code: "", country: "US" };

function SettingsPage() {
  const { companyId } = useAuth();
  const [form, setForm] = useState<CompanyForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    supabase.from("companies").select("name,email,phone,website,address,city,region,postal_code,country")
      .eq("id", companyId).maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else if (data) setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ""])) as CompanyForm });
        setLoading(false);
      });
  }, [companyId]);

  const set = <K extends keyof CompanyForm>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!companyId) return toast.error("Workspace loading");
    if (!form.name.trim()) return toast.error("Company name is required");
    setSaving(true);
    const { error } = await supabase.from("companies").update({
      name: form.name.trim(),
      email: form.email || null,
      phone: form.phone || null,
      website: form.website || null,
      address: form.address || null,
      city: form.city || null,
      region: form.region || null,
      postal_code: form.postal_code || null,
      country: form.country || null,
    }).eq("id", companyId);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
  };

  return (
    <>
      <PageHeader title="Settings" description="Company profile and contact details." />
      <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company</CardTitle>
            <CardDescription>How your business shows up to customers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <>
                <Field label="Company name *"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
                  <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
                </div>
                <Field label="Website"><Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" /></Field>
                <Button onClick={save} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Business address</CardTitle>
            <CardDescription>Used on invoices, estimates, and proposals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <>
                <Field label="Street"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
                  <Field label="State / Region"><Input value={form.region} onChange={(e) => set("region", e.target.value)} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Postal code"><Input value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} /></Field>
                  <Field label="Country"><Input value={form.country} onChange={(e) => set("country", e.target.value)} /></Field>
                </div>
                <Button onClick={save} disabled={saving} variant="outline">
                  {saving ? "Saving…" : "Save address"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
