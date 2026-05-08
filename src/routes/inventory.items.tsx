import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchItems, fetchStock, isLow, margin, totalOnHand } from "@/lib/inventory-api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/inventory/items")({ component: ItemsPage });

function ItemsPage() {
  const [q, setQ] = useState("");
  const items = useQuery({ queryKey: ["inv-items"], queryFn: fetchItems });
  const stock = useQuery({ queryKey: ["inv-stock"], queryFn: fetchStock });

  const rows = (items.data ?? [])
    .filter((i) => {
      const t = q.toLowerCase();
      return !t || i.name.toLowerCase().includes(t) || i.sku.toLowerCase().includes(t) || (i.barcode ?? "").toLowerCase().includes(t);
    })
    .map((i) => ({ ...i, on_hand: totalOnHand(i.id, stock.data ?? []) }));

  return (
    <>
      <PageHeader
        title="All Items"
        description="Every part, refrigerant, and consumable."
        actions={
          <Button size="sm" asChild style={{ backgroundImage: "var(--gradient-primary)" }}>
            <Link to="/inventory/items/new"><Plus className="mr-2 h-4 w-4" /> Add Item</Link>
          </Button>
        }
      />
      <div className="space-y-4 p-6">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name, SKU, barcode..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "sku", header: "SKU" },
            {
              key: "name",
              header: "Item",
              render: (r) => (
                <div>
                  <div className="font-medium">{r.name}</div>
                  {r.vendor_name && <div className="text-xs text-muted-foreground">Vendor: {r.vendor_name}</div>}
                </div>
              ),
            },
            { key: "category", header: "Category", render: (r) => r.category ? <Badge variant="outline">{r.category}</Badge> : <span className="text-muted-foreground">—</span> },
            { key: "on_hand", header: "On hand", className: "text-right", render: (r) => (
              <span className={isLow(r, r.on_hand) ? "font-medium text-destructive" : "font-medium"}>{r.on_hand}</span>
            )},
            { key: "reorder_point", header: "Reorder", className: "text-right" },
            { key: "unit_cost", header: "Cost", className: "text-right", render: (r) => `$${Number(r.unit_cost).toFixed(2)}` },
            { key: "unit_price", header: "Price", className: "text-right", render: (r) => `$${Number(r.unit_price).toFixed(2)}` },
            { key: "margin", header: "Margin", className: "text-right", render: (r) => `${margin(r).toFixed(0)}%` },
            { key: "barcode", header: "Barcode", render: (r) => r.barcode ?? <span className="text-muted-foreground">—</span> },
          ]}
        />
      </div>
    </>
  );
}