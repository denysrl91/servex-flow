import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { jobs } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/jobs")({ component: JobsPage });

function JobsPage() {
  return (
    <>
      <PageHeader title="Jobs" description="All work orders, past and upcoming." actions={<Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New Job</Button>} />
      <div className="p-6">
        <DataTable
          rows={jobs}
          columns={[
            { key: "id", header: "Job" },
            { key: "title", header: "Description", render: (r) => <span className="font-medium">{r.title}</span> },
            { key: "customer", header: "Customer" },
            { key: "tech", header: "Technician" },
            { key: "scheduled", header: "Scheduled" },
            { key: "priority", header: "Priority", render: (r) => <Badge variant="outline">{r.priority}</Badge> },
            { key: "status", header: "Status", render: (r) => <Badge className="bg-primary/10 text-primary border-transparent">{r.status}</Badge> },
            { key: "value", header: "Value", render: (r) => <span className="font-medium">${r.value}</span>, className: "text-right" },
          ]}
        />
      </div>
    </>
  );
}