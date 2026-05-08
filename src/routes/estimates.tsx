import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { estimates } from "@/lib/mock-data";
import { Plus, Sparkles } from "lucide-react";

const tone: Record<string, string> = {
  Approved: "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)]",
  Sent: "bg-primary/10 text-primary",
  Draft: "bg-muted text-muted-foreground",
  Rejected: "bg-destructive/15 text-destructive",
};

export const Route = createFileRoute("/estimates")({ component: EstimatesPage });

function EstimatesPage() {
  return (
    <>
      <PageHeader
        title="Estimates"
        description="Quotes and proposals — generate with AI in seconds."
        actions={
          <>
            <Button variant="outline" size="sm"><Sparkles className="mr-2 h-4 w-4" /> AI Estimate</Button>
            <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New Estimate</Button>
          </>
        }
      />
      <div className="p-6">
        <DataTable
          rows={estimates}
          columns={[
            { key: "id", header: "Estimate" },
            { key: "customer", header: "Customer", render: (r) => <span className="font-medium">{r.customer}</span> },
            { key: "title", header: "Description" },
            { key: "amount", header: "Amount", render: (r) => <span className="font-medium">${r.amount.toLocaleString()}</span>, className: "text-right" },
            { key: "created", header: "Created" },
            { key: "expires", header: "Expires" },
            { key: "status", header: "Status", render: (r) => <Badge className={`${tone[r.status]} border-transparent`}>{r.status}</Badge> },
          ]}
        />
      </div>
    </>
  );
}