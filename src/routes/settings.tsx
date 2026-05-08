import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Company, billing, integrations, and preferences." />
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Company</CardTitle>
            <CardDescription>How your business shows up to customers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Company name</Label><Input defaultValue="Acme HVAC Co." /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue="dispatch@acmehvac.com" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input defaultValue="(415) 555-0100" /></div>
            <Button style={{ backgroundImage: "var(--gradient-primary)" }}>Save changes</Button>
          </CardContent>
        </Card>
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Stay on top of jobs, payments, and tickets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "New job assigned", desc: "Email + push" },
              { label: "Invoice paid", desc: "Email" },
              { label: "Estimate approved", desc: "Email + push" },
              { label: "Overdue invoices (daily)", desc: "Email" },
              { label: "Low inventory alert", desc: "Email" },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}