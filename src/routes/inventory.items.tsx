import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchItems, fetchStock, isLow, margin, totalOnHand } from "@/lib/inventory-api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { Pencil, Plus, Search, Trash2, PackageOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory/items")({ component: ItemsPage });

function ItemsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const items = useQuery({ queryKey: ["inv-items"], queryFn: fetchItems });
  const stock = useQuery({ queryKey: ["inv-stock"], queryFn: fetchStock });

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete item "${name}"?`)) return;
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Item deleted");
    qc.invalidateQueries({ queryKey: ["inv-items"] });
    qc.invalidateQueries({ queryKey: ["inv-stock"] });
  };

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
      <div className="space-y-4 p-4 md:p-6">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name, SKU, barcode..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {items.isLoading ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">Loading items…</div>
        ) : items.error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">{(items.error as Error).message}</div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <PackageOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="text-base font-medium">No inventory items yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">Add your first part, refrigerant, or consumable to start tracking stock.</p>
            <Button asChild size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
              <Link to="/inventory/items/new"><Plus className="mr-2 h-4 w-4" /> Add Item</Link>
            </Button>
          </div>
        ) : (
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
            { key: "actions", header: "", className: "text-right", render: (r) => (
              <div className="flex justify-end gap-1">
                <Button size="icon" variant="ghost" asChild aria-label="Edit">
                  <Link to="/inventory/items/$itemId/edit" params={{ itemId: r.id }}><Pencil className="h-4 w-4 text-muted-foreground" /></Link>
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(r.id, r.name)} aria-label="Delete"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
              </div>
            )},
          ]}
        />
        )}
      </div>
    </>
  );
}