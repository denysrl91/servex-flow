import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inventory } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/inventory")({ component: InventoryPage });

function InventoryPage() {
  return (
    <>
      <PageHeader title="Inventory" description="Parts, refrigerants, and consumables across trucks and warehouses." actions={<Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>} />
      <div className="p-6">
        <DataTable
          rows={inventory}
          columns={[
            { key: "id", header: "SKU" },
            { key: "name", header: "Item", render: (r) => <span className="font-medium">{r.name}</span> },
            { key: "category", header: "Category", render: (r) => <Badge variant="outline">{r.category}</Badge> },
            { key: "onHand", header: "On hand", render: (r) => <span className={r.onHand <= r.reorder ? "font-medium text-destructive" : "font-medium"}>{r.onHand}</span>, className: "text-right" },
            { key: "reorder", header: "Reorder at", className: "text-right" },
            { key: "cost", header: "Unit cost", render: (r) => `$${r.cost.toFixed(2)}`, className: "text-right" },
            { key: "location", header: "Location" },
          ]}
        />
      </div>
    </>
  );
}