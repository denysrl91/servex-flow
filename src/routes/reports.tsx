import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { revenueByMonth } from "@/lib/mock-data";
import { TrendingUp, Users, Wrench, DollarSign } from "lucide-react";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

const reports = [
  { title: "Revenue by month", icon: DollarSign, value: "$184,320", change: "+12.4% vs last month" },
  { title: "Avg. job value", icon: TrendingUp, value: "$842", change: "+$45 vs last month" },
  { title: "First-time fix rate", icon: Wrench, value: "87%", change: "+3pts vs last month" },
  { title: "New customers", icon: Users, value: "24", change: "+6 vs last month" },
];

function ReportsPage() {
  const max = Math.max(...revenueByMonth.map((r) => r.revenue));
  return (
    <>
      <PageHeader title="Reports" description="Performance, revenue, and operational insights." />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reports.map((r) => (
            <Card key={r.title} className="shadow-[var(--shadow-card)]">
              <CardContent className="p-5">
                <r.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-2xl font-semibold">{r.value}</p>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader><CardTitle>Revenue trend</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-72 items-end gap-4">
              {revenueByMonth.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium">${(m.revenue / 1000).toFixed(0)}k</span>
                  <div className="w-full rounded-t-md" style={{ height: `${(m.revenue / max) * 100}%`, backgroundImage: "var(--gradient-primary)" }} />
                  <span className="text-xs text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}