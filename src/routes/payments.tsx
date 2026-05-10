import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Banknote, Wallet, Receipt } from "lucide-react";
import { useTenantList, fmtMoney } from "@/lib/use-tenant";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/payments")({ component: Payments });

type Payment = Database["public"]["Tables"]["payments"]["Row"];
type Customer = Pick<Database["public"]["Tables"]["customers"]["Row"], "id" | "name">;

const METHOD_TONE: Record<string, string> = {
  card: "border-primary/40 text-primary",
  ach: "border-primary/40 text-primary",
  cash: "border-[oklch(0.65_0.20_145)/0.5] text-[oklch(0.65_0.20_145)]",
  check: "border-muted-foreground/30 text-muted-foreground",
  other: "border-muted-foreground/30 text-muted-foreground",
};

function Payments() {
  const paymentsQ = useTenantList<Payment>("payments", { orderBy: { column: "paid_at", ascending: false }, limit: 200 });
  const customersQ = useTenantList<Customer>("customers", { select: "id,name" });
  const customerMap = useMemo(
    () => Object.fromEntries((customersQ.data ?? []).map((c) => [c.id, c.name])),
    [customersQ.data],
  );

  const rows = paymentsQ.data ?? [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000);
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000);

  const capturedToday = rows
    .filter((p) => p.status === "completed" && new Date(p.paid_at) >= today)
    .reduce((s, p) => s + Number(p.amount), 0);
  const pending = rows
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + Number(p.amount), 0);
  const failed7d = rows
    .filter((p) => p.status === "failed" && new Date(p.paid_at) >= sevenDaysAgo)
    .reduce((s, p) => s + Number(p.amount), 0);
  const refunded30d = rows
    .filter((p) => p.status === "refunded" && new Date(p.paid_at) >= thirtyDaysAgo)
    .reduce((s, p) => s + Number(p.amount), 0);

  const kpis = [
    { label: "Captured today", value: fmtMoney(capturedToday), icon: Banknote },
    { label: "Pending settlement", value: fmtMoney(pending), icon: Wallet },
    { label: "Failed (7d)", value: fmtMoney(failed7d), icon: CreditCard },
    { label: "Refunded (30d)", value: fmtMoney(refunded30d), icon: Receipt },
  ];

  return (
    <>
      <PageHeader title="Payments" description="Capture, reconcile, and refund customer payments." />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label} className="lift">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-muted-foreground">
                  <k.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs">{k.label}</span>
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums">{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent payments</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {paymentsQ.isLoading && (
              <div className="p-6 text-sm text-muted-foreground">Loading…</div>
            )}
            {!paymentsQ.isLoading && rows.length === 0 && (
              <div className="p-12 text-center text-sm text-muted-foreground">
                No payments yet — record one from <Link to="/invoices" className="text-primary hover:underline">an invoice</Link>.
              </div>
            )}
            {rows.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3 text-sm">
                <div>
                  <p className="font-medium">{customerMap[p.customer_id] ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.method.toUpperCase()}{p.reference ? ` · ${p.reference}` : ""} · {new Date(p.paid_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums">{fmtMoney(p.amount)}</span>
                  <Badge variant="outline" className={`capitalize ${METHOD_TONE[p.method] ?? ""}`}>{p.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
