import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  fetchItems,
  fetchLocations,
  fetchStock,
  inventoryValue,
  isLow,
  totalOnHand,
} from "@/lib/inventory-api";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Boxes, DollarSign, Plus, Truck, Warehouse } from "lucide-react";

export const Route = createFileRoute("/inventory/")({ component: Dashboard });

function Dashboard() {
  const { companyId } = useAuth();
  const items = useQuery({ queryKey: ["inv-items", companyId], queryFn: () => fetchItems(companyId!), enabled: !!companyId });
  const locs = useQuery({ queryKey: ["inv-locs", companyId], queryFn: () => fetchLocations(companyId!), enabled: !!companyId });
  const stock = useQuery({ queryKey: ["inv-stock", companyId], queryFn: () => fetchStock(companyId!), enabled: !!companyId });

  const itemList = items.data ?? [];
  const locations = locs.data ?? [];
  const stockRows = stock.data ?? [];

  const value = inventoryValue(itemList, stockRows);
  const lowStock = itemList.filter((i) => isLow(i, totalOnHand(i.id, stockRows)));
  const warehouses = locations.filter((l) => l.type === "warehouse").length;
  const vans = locations.filter((l) => l.type === "van").length;

  return (
    <>
      <PageHeader
        title="Inventory Dashboard"
        description="Live view of stock value, low items, and locations."
        actions={
          <Button size="sm" asChild style={{ backgroundImage: "var(--gradient-primary)" }}>
            <Link to="/inventory/items/new"><Plus className="mr-2 h-4 w-4" /> Add Item</Link>
          </Button>
        }
      />
      <div className="grid gap-4 p-4 md:p-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Boxes className="h-4 w-4" />} label="Active items" value={itemList.length.toString()} />
        <KpiCard icon={<DollarSign className="h-4 w-4" />} label="Inventory value (cost)" value={`$${value.cost.toFixed(0)}`} hint={`Retail $${value.retail.toFixed(0)}`} />
        <KpiCard icon={<AlertTriangle className="h-4 w-4 text-destructive" />} label="Low stock" value={lowStock.length.toString()} hint="Below reorder / min level" />
        <KpiCard icon={<Warehouse className="h-4 w-4" />} label="Warehouses / Vans" value={`${warehouses} / ${vans}`} />
      </div>

      <div className="grid gap-4 px-6 pb-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Low stock alerts</CardTitle></CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">All items are above their reorder points. 👍</p>
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.slice(0, 8).map((i) => {
                  const qty = totalOnHand(i.id, stockRows);
                  return (
                    <li key={i.id} className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">{i.name}</div>
                        <div className="text-xs text-muted-foreground">SKU {i.sku}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">{qty} on hand</Badge>
                        <div className="text-xs text-muted-foreground">Reorder at {i.reorder_point}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Stock by location</CardTitle></CardHeader>
          <CardContent>
            {locations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add a warehouse or van to track stock.</p>
            ) : (
              <ul className="divide-y divide-border">
                {locations.map((l) => {
                  const qty = stockRows
                    .filter((s) => s.location_id === l.id)
                    .reduce((a, b) => a + Number(b.quantity), 0);
                  return (
                    <li key={l.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        {l.type === "van" ? <Truck className="h-4 w-4 text-muted-foreground" /> : <Warehouse className="h-4 w-4 text-muted-foreground" />}
                        <span className="font-medium">{l.name}</span>
                        <Badge variant="outline" className="capitalize">{l.type}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{qty} units</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function KpiCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}