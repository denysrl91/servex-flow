import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { fetchItems, fetchLocations, fetchStock, totalOnHand, isLow, inventoryValue } from "@/lib/inventory-api";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Warehouse, AlertTriangle, DollarSign } from "lucide-react";

export const Route = createFileRoute("/inventory/reports")({ component: InventoryReports });

function InventoryReports() {
  const { companyId } = useAuth();
  const items = useQuery({ queryKey: ["inv-items", companyId], queryFn: () => fetchItems(companyId!), enabled: !!companyId });
  const locs = useQuery({ queryKey: ["inv-locs", companyId], queryFn: () => fetchLocations(companyId!), enabled: !!companyId });
  const stock = useQuery({ queryKey: ["inv-stock", companyId], queryFn: () => fetchStock(companyId!), enabled: !!companyId });

  const itemsArr = items.data ?? [];
  const stockArr = stock.data ?? [];
  const value = inventoryValue(itemsArr, stockArr);
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
  const maxVal = Math.max(1, ...cats.map(([, v]) => v.value));

  const kpis = [
    { label: "SKUs", value: itemsArr.length, icon: Package },
    { label: "Locations", value: (locs.data ?? []).length, icon: Warehouse },
    { label: "Low / Out", value: lowCount, icon: AlertTriangle },
    { label: "Stock value (cost)", value: `$${value.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign },
  ];

  return (
    <>
      <PageHeader title="Inventory Reports" description="Stock value, coverage, and category mix." />
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label} className="premium-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-muted-foreground"><k.icon className="h-4 w-4 text-primary" /><span className="text-xs">{k.label}</span></div>
                <p className="mt-3 text-2xl font-semibold">{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Stock value by category</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {cats.length === 0 ? <p className="text-sm text-muted-foreground">No items yet.</p> : cats.map(([cat, v]) => (
              <div key={cat}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{cat}</span><span className="text-muted-foreground">${v.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} · {v.count} units</span></div>
                <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${(v.value / maxVal) * 100}%`, backgroundImage: "var(--gradient-primary)" }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}