import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { properties } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/properties")({ component: PropertiesPage });

function PropertiesPage() {
  return (
    <>
      <PageHeader title="Properties" description="Service locations linked to your customers." actions={<Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add Property</Button>} />
      <div className="p-6">
        <DataTable
          rows={properties}
          columns={[
            { key: "id", header: "ID" },
            { key: "customer", header: "Customer", render: (r) => <span className="font-medium">{r.customer}</span> },
            { key: "address", header: "Address" },
            { key: "type", header: "Type", render: (r) => <Badge variant="outline">{r.type}</Badge> },
            { key: "units", header: "Units", className: "text-right" },
            { key: "equipment", header: "Equipment", className: "text-right" },
          ]}
        />
      </div>
    </>
  );
}