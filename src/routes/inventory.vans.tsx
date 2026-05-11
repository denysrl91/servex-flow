import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { fetchItems, fetchLocations, fetchStock, isLow } from "@/lib/inventory-api";
import { PageHeader } from "@/components/page-header";
import { LocationStockView } from "@/components/inventory/location-stock-view";

export const Route = createFileRoute("/inventory/vans")({ component: VanStock });

function VanStock() {
  const { companyId } = useAuth();
  const items = useQuery({ queryKey: ["inv-items", companyId], queryFn: () => fetchItems(companyId!), enabled: !!companyId });
  const locs = useQuery({ queryKey: ["inv-locs", companyId], queryFn: () => fetchLocations(companyId!), enabled: !!companyId });
  const stock = useQuery({ queryKey: ["inv-stock", companyId], queryFn: () => fetchStock(companyId!), enabled: !!companyId });
  const vans = (locs.data ?? []).filter((l) => l.type === "van");

  return (
    <>
      <PageHeader title="Van Stock" description="What each technician has on their truck right now." />
      <div className="space-y-6 p-4 md:p-6">
        {vans.length === 0 && (
          <p className="text-sm text-muted-foreground">No vans yet. Add a van location from Settings.</p>
        )}
        {vans.map((v) => (
          <LocationStockView key={v.id} location={v} items={items.data ?? []} stock={stock.data ?? []} isLow={isLow} />
        ))}
      </div>
    </>
  );
}