import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { equipment } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/equipment")({ component: EquipmentPage });

function EquipmentPage() {
  return (
    <>
      <PageHeader title="Equipment" description="Track every unit, warranty, and service history." actions={<Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add Equipment</Button>} />
      <div className="p-6">
        <DataTable
          rows={equipment}
          columns={[
            { key: "type", header: "Equipment", render: (r) => <div><p className="font-medium">{r.brand} {r.model}</p><p className="text-xs text-muted-foreground">{r.type} · S/N {r.serial}</p></div> },
            { key: "property", header: "Property" },
            { key: "installed", header: "Installed" },
            { key: "lastService", header: "Last service" },
            { key: "status", header: "Status", render: (r) => <Badge className={r.status === "Operational" ? "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)] border-transparent" : "bg-destructive/15 text-destructive border-transparent"}>{r.status}</Badge> },
          ]}
        />
      </div>
    </>
  );
}