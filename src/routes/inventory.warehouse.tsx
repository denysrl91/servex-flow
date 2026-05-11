import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { fetchItems, fetchLocations, fetchStock, isLow } from "@/lib/inventory-api";
import { PageHeader } from "@/components/page-header";
import { LocationStockView } from "@/components/inventory/location-stock-view";

export const Route = createFileRoute("/inventory/warehouse")({ component: WarehouseStock });

function WarehouseStock() {
  const { companyId } = useAuth();
  const items = useQuery({ queryKey: ["inv-items", companyId], queryFn: () => fetchItems(companyId!), enabled: !!companyId });
  const locs = useQuery({ queryKey: ["inv-locs", companyId], queryFn: () => fetchLocations(companyId!), enabled: !!companyId });
  const stock = useQuery({ queryKey: ["inv-stock", companyId], queryFn: () => fetchStock(companyId!), enabled: !!companyId });
  const warehouses = (locs.data ?? []).filter((l) => l.type === "warehouse");

  return (
    <>
      <PageHeader title="Warehouse Stock" description="Stock across all warehouse locations." />
      <div className="space-y-6 p-4 md:p-6">
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