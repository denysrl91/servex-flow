import type { Item, Location, StockRow } from "@/lib/inventory-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { Truck, Warehouse } from "lucide-react";

type Props = {
  location: Location;
  items: Item[];
  stock: StockRow[];
  isLow: (item: Item, qty: number) => boolean;
};

export function LocationStockView({ location, items, stock, isLow }: Props) {
  const itemMap = new Map(items.map((i) => [i.id, i]));
  const rows = stock
    .filter((s) => s.location_id === location.id)
    .map((s) => {
      const item = itemMap.get(s.item_id);
      return item ? { ...item, quantity: Number(s.quantity) } : null;
    })
    .filter(Boolean) as Array<Item & { quantity: number }>;

  const total = rows.reduce((a, b) => a + b.quantity, 0);
  const value = rows.reduce((a, b) => a + b.quantity * Number(b.unit_cost), 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          {location.type === "van" ? <Truck className="h-4 w-4" /> : <Warehouse className="h-4 w-4" />}
          {location.name}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{rows.length} SKUs</Badge>
          <Badge variant="outline">{total} units</Badge>
          <Badge variant="outline">${value.toFixed(0)} value</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stock at this location.</p>
        ) : (
          <DataTable
            rows={rows}
            columns={[
              { key: "sku", header: "SKU" },
              { key: "name", header: "Item", render: (r) => <span className="font-medium">{r.name}</span> },
              { key: "quantity", header: "Qty", className: "text-right", render: (r) => (
                <span className={isLow(r, r.quantity) ? "font-medium text-destructive" : "font-medium"}>{r.quantity}</span>
              )},
              { key: "reorder_point", header: "Reorder", className: "text-right" },
              { key: "unit_cost", header: "Cost", className: "text-right", render: (r) => `$${Number(r.unit_cost).toFixed(2)}` },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}