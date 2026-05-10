import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, ExternalLink, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchEstimates, STATUS_LABEL, STATUS_TONE, type EstimateRow } from "@/lib/estimates-api";
import { toast } from "sonner";

export const Route = createFileRoute("/estimates")({ component: EstimatesPage });

function EstimatesPage() {
  const [rows, setRows] = useState<EstimateRow[]>([]);
  const [customers, setCustomers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await fetchEstimates().catch(() => []);
      setRows(data);
      const ids = Array.from(new Set(data.map((r) => r.customer_id)));
      if (ids.length) {
        const { data: cs } = await supabase.from("customers").select("id,name").in("id", ids);
        setCustomers(Object.fromEntries((cs ?? []).map((c) => [c.id, c.name])));
      }
      setLoading(false);
    })();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this estimate?")) return;
    const { error } = await supabase.from("estimates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Estimate deleted");
    setRows((r) => r.filter((e) => e.id !== id));
  };

  return (
    <>
      <PageHeader
        title="Estimates"
        description="Build sales-ready Good / Better / Best proposals."
        actions={
          <Link to="/estimates/new">
            <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
              <Plus className="mr-2 h-4 w-4" /> New Estimate
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Estimate</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Expires</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{r.estimate_number}</td>
                    <td className="px-4 py-3 font-medium">{customers[r.customer_id] ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.title}</td>
                    <td className="px-4 py-3 text-right font-semibold">${Number(r.total).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.expires_at ?? "—"}</td>
                    <td className="px-4 py-3"><Badge className={`${STATUS_TONE[r.status]} border-transparent`}>{STATUS_LABEL[r.status]}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to="/estimates/$estimateId" params={{ estimateId: r.id }}>
                          <Button size="sm" variant="ghost"><FileText className="h-4 w-4" /></Button>
                        </Link>
                        <Link to="/estimates/$estimateId/proposal" params={{ estimateId: r.id }}>
                          <Button size="sm" variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => remove(r.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
      <FileText className="h-10 w-10 text-muted-foreground" />
      <h3 className="mt-3 text-base font-semibold">No estimates yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create your first proposal — add labor, parts, equipment and present Good / Better / Best options.
      </p>
      <Link to="/estimates/new" className="mt-4">
        <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
          <Plus className="mr-2 h-4 w-4" /> New Estimate
        </Button>
      </Link>
    </div>
  );
}