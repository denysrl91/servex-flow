import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchItems, fetchLocations, fetchStock, isLow } from "@/lib/inventory-api";
import { PageHeader } from "@/components/page-header";
import { LocationStockView } from "@/components/inventory/location-stock-view";

export const Route = createFileRoute("/inventory/warehouse")({ component: WarehouseStock });

function WarehouseStock() {
  const items = useQuery({ queryKey: ["inv-items"], queryFn: fetchItems });
  const locs = useQuery({ queryKey: ["inv-locs"], queryFn: fetchLocations });
  const stock = useQuery({ queryKey: ["inv-stock"], queryFn: fetchStock });
  const warehouses = (locs.data ?? []).filter((l) => l.type === "warehouse");

  return (
    <>
      <PageHeader title="Warehouse Stock" description="Stock across all warehouse locations." />
      <div className="space-y-6 p-6">
        {warehouses.length === 0 && (
          <p className="text-sm text-muted-foreground">No warehouses yet. Add one from Settings to begin tracking stock.</p>
        )}
        {warehouses.map((w) => (
          <LocationStockView key={w.id} location={w} items={items.data ?? []} stock={stock.data ?? []} isLow={isLow} />
        ))}
      </div>
    </>
  );
}