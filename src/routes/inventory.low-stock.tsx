import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { fetchItems, fetchStock, totalOnHand, isLow } from "@/lib/inventory-api";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/inventory/low-stock")({ component: LowStock });

function LowStock() {
  const { companyId } = useAuth();
  const items = useQuery({ queryKey: ["inv-items", companyId], queryFn: () => fetchItems(companyId!), enabled: !!companyId });
  const stock = useQuery({ queryKey: ["inv-stock", companyId], queryFn: () => fetchStock(companyId!), enabled: !!companyId });
  const list = (items.data ?? [])
    .map((i) => ({ item: i, qty: totalOnHand(i.id, stock.data ?? []) }))
    .filter(({ item, qty }) => isLow(item, qty))
    .sort((a, b) => a.qty - b.qty);

  return (
    <>
      <PageHeader
        title="Low Stock"
        description="Items at or below reorder point across every location."
        actions={
          <Button asChild size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
            <Link to="/purchase-orders"><ShoppingCart className="mr-2 h-4 w-4" /> Create PO</Link>
          </Button>
        }
      />
      <div className="p-6">
        {items.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : list.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">All stock levels healthy.</CardContent></Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Item</th>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-right">On hand</th>
                    <th className="px-4 py-3 text-right">Reorder pt.</th>
                    <th className="px-4 py-3 text-right">Min level</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(({ item, qty }) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.sku}</td>
                      <td className="px-4 py-3 text-right font-semibold">{qty}</td>
                      <td className="px-4 py-3 text-right">{item.reorder_point ?? 0}</td>
                      <td className="px-4 py-3 text-right">{item.min_stock_level ?? 0}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge className="bg-destructive/15 text-destructive border-transparent">
                          <AlertTriangle className="mr-1 h-3 w-3" /> {qty === 0 ? "Out" : "Low"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}