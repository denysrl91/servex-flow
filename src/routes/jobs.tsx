import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { jobs as mockJobs } from "@/lib/mock-data";
import { Plus, Wrench } from "lucide-react";

export const Route = createFileRoute("/jobs")({ component: JobsPage });

type JobRow = {
  id: string;
  job_number: string;
  title: string;
  status: string;
  priority: string;
  scheduled_start: string | null;
  total_value: number;
};

function JobsPage() {
  const q = useQuery({
    queryKey: ["jobs-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id,job_number,title,status,priority,scheduled_start,total_value")
        .order("scheduled_start", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as JobRow[];
    },
  });

  const realRows = q.data ?? [];

  return (
    <>
      <PageHeader title="Jobs" description="All work orders, past and upcoming." actions={<Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New Job</Button>} />
      <div className="p-6">
        {realRows.length > 0 ? (
          <DataTable
            rows={realRows}
            columns={[
              { key: "job_number", header: "Job" },
              { key: "title", header: "Description", render: (r) => <span className="font-medium">{r.title}</span> },
              { key: "scheduled_start", header: "Scheduled", render: (r) => r.scheduled_start ? new Date(r.scheduled_start).toLocaleString() : "—" },
              { key: "priority", header: "Priority", render: (r) => <Badge variant="outline">{r.priority}</Badge> },
              { key: "status", header: "Status", render: (r) => <Badge className="bg-primary/10 text-primary border-transparent">{r.status}</Badge> },
              { key: "total_value", header: "Value", className: "text-right", render: (r) => <span className="font-medium">${Number(r.total_value).toFixed(0)}</span> },
              { key: "actions", header: "", render: (r) => (
                <Button asChild size="sm" variant="outline">
                  <Link to="/jobs/$jobId/parts" params={{ jobId: r.id }}><Wrench className="mr-2 h-3.5 w-3.5" /> Parts</Link>
                </Button>
              ) },
            ]}
          />
        ) : (
          <DataTable
            rows={mockJobs}
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
        )}
      </div>
    </>
  );
}