import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchItems, fetchLocations, fetchStock, totalOnHand, isLow, inventoryValue } from "@/lib/inventory-api";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Wrench, DollarSign, BarChart3, Package, Warehouse, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

function ReportsPage() {
  const { companyId } = useAuth();

  const q = useQuery({
    queryKey: ["reports-overview"],
    queryFn: async () => {
      const now = new Date();
      const months: { label: string; from: string; to: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        months.push({ label: start.toLocaleString(undefined, { month: "short" }), from: start.toISOString(), to: end.toISOString() });
      }

      const monthly = await Promise.all(months.map(async (m) => {
        const { data } = await supabase.from("payments").select("amount").gte("paid_at", m.from).lt("paid_at", m.to);
        return { month: m.label, revenue: (data ?? []).reduce((s, r: any) => s + Number(r.amount), 0) };
      }));

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const [jobsAll, custMonth, custLast, payMonth] = await Promise.all([
        supabase.from("jobs").select("total_value,status,actual_end").eq("status", "completed").gte("actual_end", monthStart),
        supabase.from("customers").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
        supabase.from("customers").select("id", { count: "exact", head: true }).gte("created_at", lastMonthStart).lt("created_at", monthStart),
        supabase.from("payments").select("amount").gte("paid_at", monthStart),
      ]);

      const jobs = jobsAll.data ?? [];
      const completedRev = jobs.reduce((s, r: any) => s + Number(r.total_value ?? 0), 0);
      const avgTicket = jobs.length ? completedRev / jobs.length : 0;
      const monthRev = (payMonth.data ?? []).reduce((s, r: any) => s + Number(r.amount), 0);

      return {
        monthly,
        monthRev,
        avgTicket,
        completedJobs: jobs.length,
        newCustomers: custMonth.count ?? 0,
        newCustomersLast: custLast.count ?? 0,
      };
    },
  });

  const items = useQuery({ queryKey: ["inv-items", companyId], queryFn: () => fetchItems(companyId!), enabled: !!companyId });
  const locs = useQuery({ queryKey: ["inv-locs", companyId], queryFn: () => fetchLocations(companyId!), enabled: !!companyId });
  const stock = useQuery({ queryKey: ["inv-stock", companyId], queryFn: () => fetchStock(companyId!), enabled: !!companyId });

  const itemsArr = items.data ?? [];
  const stockArr = stock.data ?? [];
  const invVal = inventoryValue(itemsArr, stockArr);
  const lowCount = itemsArr.filter((i) => isLow(i, totalOnHand(i.id, stockArr))).length;

  const byCategory = itemsArr.reduce<Record<string, { count: number; value: number }>>((acc, i) => {
    const cat = i.category ?? "Uncategorized";
    const qty = totalOnHand(i.id, stockArr);
    acc[cat] ??= { count: 0, value: 0 };
    acc[cat].count += qty;
    acc[cat].value += qty * Number(i.unit_cost);
    return acc;
  }, {});
  const cats = Object.entries(byCategory).sort((a, b) => b[1].value - a[1].value);
  const maxCatVal = Math.max(1, ...cats.map(([, v]) => v.value));

  const d = q.data;
  const max = d ? Math.max(1, ...d.monthly.map((m) => m.revenue)) : 1;
  const cards = [
    { title: "Revenue this month", icon: DollarSign, value: d ? `$${Math.round(d.monthRev).toLocaleString()}` : "—" },
    { title: "Average completed job", icon: TrendingUp, value: d ? `$${Math.round(d.avgTicket).toLocaleString()}` : "—" },
    { title: "Completed jobs", icon: Wrench, value: d ? String(d.completedJobs) : "—" },
    { title: "New customers", icon: Users, value: d ? String(d.newCustomers) : "—", change: d ? `${d.newCustomers - d.newCustomersLast >= 0 ? "+" : ""}${d.newCustomers - d.newCustomersLast} vs last month` : undefined },
  ];

  const invKpis = [
    { label: "SKUs", value: itemsArr.length, icon: Package },
    { label: "Locations", value: (locs.data ?? []).length, icon: Warehouse },
    { label: "Low / Out", value: lowCount, icon: AlertTriangle },
    { label: "Stock value (cost)", value: `$${invVal.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign },
  ];

  return (
    <>
      <PageHeader title="Reports" description="All performance, revenue, operational, and inventory metrics." />
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((r) => (
            <Card key={r.title}>
              <CardContent className="p-5">
                <r.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-2xl font-semibold">{r.value}</p>
                <p className="text-sm font-medium">{r.title}</p>
                {r.change && <p className="text-xs text-muted-foreground">{r.change}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Revenue trend (last 6 months)</CardTitle></CardHeader>
          <CardContent>
            {!d ? <div className="text-sm text-muted-foreground">Loading…</div> : d.monthly.every((m) => m.revenue === 0) ? (
              <div className="rounded-md border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
                No revenue recorded yet. Once payments are captured they'll appear here.
              </div>
            ) : (
              <div className="flex h-72 items-end gap-4">
                {d.monthly.map((m) => (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-medium">${(m.revenue / 1000).toFixed(0)}k</span>
                    <div className="w-full rounded-t-md" style={{ height: `${(m.revenue / max) * 100}%`, backgroundImage: "var(--gradient-primary)" }} />
                    <span className="text-xs text-muted-foreground">{m.month}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          {invKpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-muted-foreground"><k.icon className="h-4 w-4 text-primary" /><span className="text-xs">{k.label}</span></div>
                <p className="mt-3 text-2xl font-semibold">{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Inventory value by category</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {cats.length === 0 ? <p className="text-sm text-muted-foreground">No items yet.</p> : cats.map(([cat, v]) => (
              <div key={cat}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{cat}</span><span className="text-muted-foreground">${v.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} · {v.count} units</span></div>
                <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${(v.value / maxCatVal) * 100}%`, backgroundImage: "var(--gradient-primary)" }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
