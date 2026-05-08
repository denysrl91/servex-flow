import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { pipeline } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/pipeline")({ component: PipelinePage });

function PipelinePage() {
  return (
    <>
      <PageHeader title="Sales Pipeline" description="Track opportunities from lead to close." actions={<Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Add Deal</Button>} />
      <div className="overflow-x-auto p-6">
        <div className="flex min-w-max gap-4">
          {pipeline.map((col) => {
            const total = col.deals.reduce((s, d) => s + d.value, 0);
            return (
              <div key={col.stage} className="w-72 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold">{col.stage}</h3>
                  <span className="text-xs text-muted-foreground">{col.deals.length} · ${total.toLocaleString()}</span>
                </div>
                <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-2">
                  {col.deals.map((d) => (
                    <Card key={d.id} className="cursor-grab p-3 shadow-[var(--shadow-card)] hover:shadow-md">
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">${d.value.toLocaleString()}</p>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}