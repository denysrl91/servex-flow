import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Wrench, FileText } from "lucide-react";

export const Route = createFileRoute("/crm")({ component: CRM });

const tiles = [
  { to: "/customers", title: "Customers", desc: "Profiles, communication, lifetime value", icon: Users },
  { to: "/properties", title: "Properties", desc: "Buildings, access notes, system count", icon: Building2 },
  { to: "/equipment", title: "Equipment", desc: "Brand, serial, warranty, service history", icon: Wrench },
  { to: "/estimates", title: "Estimates", desc: "Good / Better / Best proposals", icon: FileText },
] as const;

function CRM() {
  return (
    <>
      <PageHeader title="CRM" description="Customer relationships, properties, and equipment in one place." />
      <div className="grid gap-4 p-4 md:p-6 md:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to}>
            <Card className="premium-card transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground glow-primary" style={{ backgroundImage: "var(--gradient-primary)" }}>
                  <t.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{t.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{t.desc}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
