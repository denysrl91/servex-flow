import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tickets } from "@/lib/mock-data";
import { Plus } from "lucide-react";

const tone: Record<string, string> = {
  Open: "bg-destructive/15 text-destructive",
  "In Progress": "bg-primary/10 text-primary",
  Resolved: "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)]",
};

export const Route = createFileRoute("/tickets")({ component: TicketsPage });

function TicketsPage() {
  return (
    <>
      <PageHeader title="Customer Service Tickets" description="Inbound requests from customers and field." actions={<Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New Ticket</Button>} />
      <div className="p-6">
        <DataTable
          rows={tickets}
          columns={[
            { key: "id", header: "Ticket" },
            { key: "subject", header: "Subject", render: (r) => <span className="font-medium">{r.subject}</span> },
            { key: "customer", header: "Customer" },
            { key: "assigned", header: "Assigned" },
            { key: "priority", header: "Priority", render: (r) => <Badge variant="outline">{r.priority}</Badge> },
            { key: "status", header: "Status", render: (r) => <Badge className={`${tone[r.status]} border-transparent`}>{r.status}</Badge> },
            { key: "created", header: "Created" },
          ]}
        />
      </div>
    </>
  );
}