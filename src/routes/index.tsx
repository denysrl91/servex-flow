import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, Briefcase, Calendar, Receipt, Package, Users, Wrench,
  TrendingUp, AlertTriangle, Plus, ArrowUpRight, FileText, LifeBuoy, Boxes,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

function startOfDay(d = new Date()) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString(); }
function startOfMonth() { const x = new Date(); x.setDate(1); x.setHours(0, 0, 0, 0); return x.toISOString(); }

function Dashboard() {
  const dash = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const today = startOfDay();
      const month = startOfMonth();
      const [
        invToday, invMonth, openInv, jobsActive, jobsToday, completedToday,
        recentJobs, recentInvoices, lowStock, techs, tickets,
      ] = await Promise.all([
        supabase.from("payments").select("amount").gte("paid_at", today),
        supabase.from("payments").select("amount").gte("paid_at", month),
        supabase.from("invoices").select("balance_due,due_at,status").gt("balance_due", 0),
        supabase.from("jobs").select("id", { count: "exact", head: true }).in("status", ["scheduled", "dispatched", "in_progress", "on_the_way", "arrived"]),
        supabase.from("jobs").select("id", { count: "exact", head: true }).gte("scheduled_start", today),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "completed").gte("actual_end", today),
        supabase.from("jobs").select("id,job_number,title,status,priority,scheduled_start,total_value,customer_id").order("scheduled_start", { ascending: false }).limit(6),
        supabase.from("invoices").select("id,invoice_number,total,balance_due,status,due_at,customer_id").order("created_at", { ascending: false }).limit(6),
        supabase.from("inventory_items").select("id,name,sku,reorder_point,min_stock_level").limit(50),
        supabase.from("technicians").select("id,full_name,role_title,status").order("full_name").limit(8),
        supabase.from("service_tickets").select("id,ticket_number,subject,priority,status,created_at").in("status", ["open", "in_progress"]).order("created_at", { ascending: false }).limit(5),
      ]);

      const sum = (rows: { amount?: number }[] | null) =>
        (rows ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
      const sumBalance = (rows: { balance_due?: number }[] | null) =>
        (rows ?? []).reduce((s, r) => s + Number(r.balance_due ?? 0), 0);
      const overdue = (openInv.data ?? []).filter((i) => i.due_at && new Date(i.due_at) < new Date()).length;

      // pull customer names for joins
      const cIds = Array.from(new Set([
        ...(recentJobs.data ?? []).map((j) => j.customer_id),
        ...(recentInvoices.data ?? []).map((i) => i.customer_id),
      ].filter(Boolean) as string[]));
      const custMap = new Map<string, string>();
      if (cIds.length) {
        const { data } = await supabase.from("customers").select("id,name").in("id", cIds);
        (data ?? []).forEach((c) => custMap.set(c.id, c.name));
      }

      return {
        revenueToday: sum(invToday.data),
        revenueMonth: sum(invMonth.data),
        openInvoiceTotal: sumBalance(openInv.data),
        overdueCount: overdue,
        activeJobs: jobsActive.count ?? 0,
        scheduledToday: jobsToday.count ?? 0,
        completedToday: completedToday.count ?? 0,
        recentJobs: recentJobs.data ?? [],
        recentInvoices: recentInvoices.data ?? [],
        lowStock: (lowStock.data ?? []).filter((i: any) => Number(i.min_stock_level ?? 0) > 0).slice(0, 6),
        techs: techs.data ?? [],
        tickets: tickets.data ?? [],
        custMap,
      };
    },
  });

  const d = dash.data;
  const money = (n: number) => "$" + Math.round(n).toLocaleString();

  const kpis = [
    { label: "Revenue today", value: d ? money(d.revenueToday) : "—", icon: DollarSign, to: "/payments" },
    { label: "Revenue this month", value: d ? money(d.revenueMonth) : "—", icon: TrendingUp, to: "/reports" },
    { label: "Outstanding invoices", value: d ? money(d.openInvoiceTotal) : "—", sub: d?.overdueCount ? `${d.overdueCount} overdue` : undefined, icon: Receipt, to: "/invoices" },
    { label: "Active jobs", value: d ? String(d.activeJobs) : "—", icon: Briefcase, to: "/jobs" },
    { label: "Scheduled today", value: d ? String(d.scheduledToday) : "—", icon: Calendar, to: "/schedule" },
    { label: "Completed today", value: d ? String(d.completedToday) : "—", icon: Wrench, to: "/jobs" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Dashboard"
        description="Live overview of revenue, jobs, technicians, and inventory."
        actions={
          <>
            <Button asChild size="sm" variant="outline"><Link to="/jobs"><Plus className="mr-2 h-4 w-4" /> New job</Link></Button>
            <Button asChild size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Link to="/customers"><Plus className="mr-2 h-4 w-4" /> New customer</Link></Button>
          </>
        }
      />

      <div className="space-y-6 p-4 md:p-6">
        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpis.map((k) => (
            <Link key={k.label} to={k.to} className="block">
              <Card className="h-full transition hover:border-primary/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k.label}</p>
                    <k.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{k.value}</p>
                  {k.sub && <p className="text-xs text-destructive">{k.sub}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Recent jobs */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base"><Briefcase className="h-4 w-4 text-primary" /> Recent jobs</CardTitle>
              <Button asChild size="sm" variant="ghost"><Link to="/jobs">View all <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
            </CardHeader>
            <CardContent>
              {!d ? <SkeletonRows /> : d.recentJobs.length === 0 ? (
                <EmptyState icon={Briefcase} title="No jobs yet" description="Create your first work order to start dispatching." cta={{ to: "/jobs", label: "Create job" }} />
              ) : (
                <div className="space-y-2">
                  {d.recentJobs.map((j: any) => (
                    <div key={j.id} className="flex items-center justify-between rounded-md border border-border/60 p-3 hover:bg-muted/30">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{j.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{j.job_number} · {d.custMap.get(j.customer_id) ?? "—"}{j.scheduled_start ? ` · ${new Date(j.scheduled_start).toLocaleString()}` : ""}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline" className="capitalize">{j.priority}</Badge>
                        <Badge className="border-transparent bg-primary/10 capitalize text-primary">{j.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base"><LifeBuoy className="h-4 w-4 text-primary" /> Open tickets</CardTitle>
              <Button asChild size="sm" variant="ghost"><Link to="/tickets">All <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
            </CardHeader>
            <CardContent>
              {!d ? <SkeletonRows /> : d.tickets.length === 0 ? (
                <EmptyState icon={LifeBuoy} title="No open tickets" description="Inbound customer issues will appear here." cta={{ to: "/tickets", label: "New ticket" }} />
              ) : (
                <div className="space-y-2">
                  {d.tickets.map((t: any) => (
                    <div key={t.id} className="rounded-md border border-border/60 p-3">
                      <p className="truncate text-sm font-medium">{t.subject}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t.ticket_number}</span>
                        <Badge variant="outline" className="capitalize">{t.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent invoices */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base"><Receipt className="h-4 w-4 text-primary" /> Recent invoices</CardTitle>
              <Button asChild size="sm" variant="ghost"><Link to="/invoices">All <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
            </CardHeader>
            <CardContent>
              {!d ? <SkeletonRows /> : d.recentInvoices.length === 0 ? (
                <EmptyState icon={FileText} title="No invoices yet" description="Generate an invoice from a completed job." cta={{ to: "/invoices", label: "Create invoice" }} />
              ) : (
                <div className="overflow-x-auto rounded-md border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr><th className="px-3 py-2 text-left">Invoice</th><th className="px-3 py-2 text-left">Customer</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2 text-right">Balance</th></tr>
                    </thead>
                    <tbody>
                      {d.recentInvoices.map((i: any) => (
                        <tr key={i.id} className="border-t border-border/60">
                          <td className="px-3 py-2 font-medium">{i.invoice_number}</td>
                          <td className="px-3 py-2 text-muted-foreground">{d.custMap.get(i.customer_id) ?? "—"}</td>
                          <td className="px-3 py-2"><Badge variant="outline" className="capitalize">{i.status}</Badge></td>
                          <td className="px-3 py-2 text-right">{money(Number(i.total))}</td>
                          <td className="px-3 py-2 text-right font-medium">{money(Number(i.balance_due))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low stock */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-[oklch(0.78_0.16_75)]" /> Low stock</CardTitle>
              <Button asChild size="sm" variant="ghost"><Link to="/inventory/low-stock">All <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
            </CardHeader>
            <CardContent>
              {!d ? <SkeletonRows /> : d.lowStock.length === 0 ? (
                <EmptyState icon={Package} title="Stock is healthy" description="Items below their minimum will surface here." cta={{ to: "/inventory", label: "Open inventory" }} />
              ) : (
                <div className="space-y-2">
                  {d.lowStock.map((i: any) => (
                    <div key={i.id} className="flex items-center justify-between rounded-md border border-border/60 p-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{i.name}</p>
                        <p className="text-xs text-muted-foreground">{i.sku}</p>
                      </div>
                      <Badge variant="outline">min {i.min_stock_level}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technicians */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-primary" /> Technicians</CardTitle>
              <Button asChild size="sm" variant="ghost"><Link to="/technicians">All <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
            </CardHeader>
            <CardContent>
              {!d ? <SkeletonRows /> : d.techs.length === 0 ? (
                <EmptyState icon={Users} title="No technicians yet" description="Invite your field team to start dispatching jobs." cta={{ to: "/technicians", label: "Invite tech" }} />
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {d.techs.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-3 rounded-md border border-border/60 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground" style={{ backgroundImage: "var(--gradient-primary)" }}>
                        {(t.full_name ?? "?").split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{t.full_name}</p>
                        <p className="truncate text-xs text-muted-foreground">{t.role_title ?? "Technician"} · {t.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function EmptyState({ icon: Icon, title, description, cta }: { icon: any; title: string; description: string; cta: { to: string; label: string } }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-border bg-card/40 p-8 text-center">
      <Icon className="h-8 w-8 text-muted-foreground" />
      <h3 className="mt-2 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <Button asChild size="sm" variant="outline" className="mt-3"><Link to={cta.to as never}><Plus className="mr-1.5 h-3.5 w-3.5" /> {cta.label}</Link></Button>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-md bg-muted/40" />)}
    </div>
  );
}
