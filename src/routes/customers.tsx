import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { customers } from "@/lib/mock-data";
import { Plus, Download, Search } from "lucide-react";

export const Route = createFileRoute("/customers")({ component: CustomersPage });

function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage residential and commercial accounts."
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Export</Button>
            <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add Customer</Button>
          </>
        }
      />
      <div className="space-y-4 p-6">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search customers..." className="pl-9" />
        </div>
        <DataTable
          rows={customers}
          columns={[
            { key: "name", header: "Customer", render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.id}</p></div> },
            { key: "type", header: "Type", render: (r) => <Badge variant="outline">{r.type}</Badge> },
            { key: "contact", header: "Primary contact" },
            { key: "phone", header: "Phone" },
            { key: "properties", header: "Properties", className: "text-right" },
            { key: "ltv", header: "Lifetime value", render: (r) => <span className="font-medium">${r.lifetimeValue.toLocaleString()}</span>, className: "text-right" },
            { key: "status", header: "Status", render: (r) => <Badge className={r.status === "Active" ? "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)] border-transparent" : "bg-muted text-muted-foreground border-transparent"}>{r.status}</Badge> },
          ]}
        />
      </div>
    </>
  );
}