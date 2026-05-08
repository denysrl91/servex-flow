import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { purchaseOrders } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/purchase-orders")({ component: POPage });

function POPage() {
  return (
    <>
      <PageHeader title="Purchase Orders" description="Vendor orders and receiving." actions={<Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New PO</Button>} />
      <div className="p-6">
        <DataTable
          rows={purchaseOrders}
          columns={[
            { key: "id", header: "PO #" },
            { key: "vendor", header: "Vendor", render: (r) => <span className="font-medium">{r.vendor}</span> },
            { key: "items", header: "Items", className: "text-right" },
            { key: "total", header: "Total", render: (r) => <span className="font-medium">${r.total.toLocaleString()}</span>, className: "text-right" },
            { key: "created", header: "Created" },
            { key: "status", header: "Status", render: (r) => <Badge variant="outline">{r.status}</Badge> },
          ]}
        />
      </div>
    </>
  );
}