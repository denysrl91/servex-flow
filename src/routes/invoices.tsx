import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { invoices } from "@/lib/mock-data";
import { Plus } from "lucide-react";

const tone: Record<string, string> = {
  Paid: "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)]",
  Sent: "bg-primary/10 text-primary",
  Draft: "bg-muted text-muted-foreground",
  Overdue: "bg-destructive/15 text-destructive",
};

export const Route = createFileRoute("/invoices")({ component: InvoicesPage });

function InvoicesPage() {
  return (
    <>
      <PageHeader title="Invoices" description="Send, track payments, and chase overdue balances." actions={<Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>} />
      <div className="p-6">
        <DataTable
          rows={invoices}
          columns={[
            { key: "id", header: "Invoice" },
            { key: "customer", header: "Customer", render: (r) => <span className="font-medium">{r.customer}</span> },
            { key: "issued", header: "Issued" },
            { key: "due", header: "Due" },
            { key: "amount", header: "Amount", render: (r) => <span className="font-medium">${r.amount.toLocaleString()}</span>, className: "text-right" },
            { key: "status", header: "Status", render: (r) => <Badge className={`${tone[r.status]} border-transparent`}>{r.status}</Badge> },
          ]}
        />
      </div>
    </>
  );
}