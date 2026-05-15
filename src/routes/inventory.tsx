import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventory")({ component: InventoryLayout });

type Tab = { to: string; label: string; exact?: boolean };
const TABS: Tab[] = [
  { to: "/inventory", label: "Dashboard", exact: true },
  { to: "/inventory/items", label: "All Items" },
  { to: "/inventory/warehouse", label: "Warehouse Stock" },
  { to: "/inventory/vans", label: "Van Stock" },
  { to: "/inventory/transfer", label: "Transfer" },
  { to: "/inventory/low-stock", label: "Low Stock" },
  { to: "/purchase-orders", label: "Purchase Orders" },
];

function InventoryLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-card/40">
        <div className="flex flex-wrap gap-1 overflow-x-auto px-4 pt-3">
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to as never}
                className={cn(
                  "whitespace-nowrap rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
      <Outlet />
    </div>
  );
}