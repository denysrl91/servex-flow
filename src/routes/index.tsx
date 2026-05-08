import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { stats, jobs, tickets, revenueByMonth, technicians } from "@/lib/mock-data";
import { DollarSign, Briefcase, HardHat, Headphones, FileText, Receipt, Plus, Sparkles, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const statCards = [
  { label: "Revenue (MTD)", value: `$${stats.revenue.toLocaleString()}`, change: "+12.4%", icon: DollarSign, tone: "text-primary" },
  { label: "Jobs Today", value: stats.jobsToday, change: "+3", icon: Briefcase, tone: "text-[oklch(0.65_0.16_150)]" },
  { label: "Active Technicians", value: stats.activeTechs, change: "100%", icon: HardHat, tone: "text-[oklch(0.72_0.18_50)]" },
  { label: "Open Tickets", value: stats.openTickets, change: "-2", icon: Headphones, tone: "text-primary" },
  { label: "Pending Estimates", value: stats.pendingEstimates, change: "+5", icon: FileText, tone: "text-[oklch(0.78_0.16_80)]" },
  { label: "Unpaid Invoices", value: `$${stats.unpaidInvoices.toLocaleString()}`, change: "4 overdue", icon: Receipt, tone: "text-destructive" },
];

const statusTone: Record<string, string> = {
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  "Scheduled": "bg-muted text-muted-foreground border-border",
  "Dispatched": "bg-[oklch(0.72_0.18_50)/0.12] text-[oklch(0.55_0.18_50)] border-[oklch(0.72_0.18_50)/0.3]",
  "Open": "bg-destructive/10 text-destructive border-destructive/20",
  "Resolved": "bg-[oklch(0.65_0.16_150)/0.12] text-[oklch(0.45_0.16_150)] border-[oklch(0.65_0.16_150)/0.3]",
};

function Index() {
  const maxRevenue = Math.max(...revenueByMonth.map((r) => r.revenue));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back, Riley. Here's what's happening today."
        actions={
          <>
            <Button variant="outline" size="sm"><Sparkles className="mr-2 h-4 w-4" /> Ask Servex AI</Button>
            <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New Job</Button>
          </>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {statCards.map((s) => (
            <Card key={s.label} className="shadow-[var(--shadow-card)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <s.icon className={`h-4 w-4 ${s.tone}`} />
                  <span className="text-xs font-medium text-muted-foreground">{s.change}</span>
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Revenue trend</CardTitle>
              <Button variant="ghost" size="sm">Last 6 months <ArrowUpRight className="ml-1 h-3 w-3" /></Button>
            </CardHeader>
            <CardContent>
              <div className="flex h-56 items-end gap-3">
                {revenueByMonth.map((m) => (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t-md transition-all hover:opacity-80" style={{ height: `${(m.revenue / maxRevenue) * 100}%`, backgroundImage: "var(--gradient-primary)" }} />
                    <span className="text-xs text-muted-foreground">{m.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Tech utilization</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {technicians.slice(0, 5).map((t) => (
                <div key={t.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-muted-foreground">{t.utilization}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${t.utilization}%`, backgroundImage: "var(--gradient-primary)" }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Today's jobs</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {jobs.slice(0, 5).map((j) => (
                <div key={j.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{j.title}</p>
                    <p className="text-xs text-muted-foreground">{j.customer} · {j.tech} · {j.scheduled.split(" ")[1]}</p>
                  </div>
                  <Badge variant="outline" className={statusTone[j.status] ?? ""}>{j.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Recent tickets</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.customer} · {t.assigned}</p>
                  </div>
                  <Badge variant="outline" className={statusTone[t.status] ?? ""}>{t.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
