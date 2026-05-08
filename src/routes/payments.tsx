import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Banknote, Wallet, Receipt } from "lucide-react";

export const Route = createFileRoute("/payments")({ component: Payments });

const recent = [
  { id: "PMT-3201", customer: "Sunrise Apartments", amount: 480, method: "Card · Visa 4242", date: "Today 10:14", status: "Captured" },
  { id: "PMT-3200", customer: "Bayview Office Park", amount: 1850, method: "ACH Transfer", date: "Today 09:02", status: "Captured" },
  { id: "PMT-3199", customer: "Greenfield Schools", amount: 2400, method: "Check #4421", date: "Yesterday", status: "Pending" },
  { id: "PMT-3198", customer: "Marcus Lee", amount: 320, method: "Card · Mastercard 8821", date: "Yesterday", status: "Captured" },
];

const kpis = [
  { label: "Captured today", value: "$2,650", icon: Banknote },
  { label: "Pending settlement", value: "$3,420", icon: Wallet },
  { label: "Failed (7d)", value: "$0", icon: CreditCard },
  { label: "Refunded (30d)", value: "$185", icon: Receipt },
];

function Payments() {
  return (
    <>
      <PageHeader title="Payments" description="Capture, reconcile, and refund customer payments." />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label} className="premium-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-muted-foreground">
                  <k.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs">{k.label}</span>
                </div>
                <p className="mt-3 text-2xl font-semibold">{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="premium-card">
          <CardHeader><CardTitle className="text-base">Recent payments</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{r.customer}</p>
                  <p className="text-xs text-muted-foreground">{r.id} · {r.method} · {r.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">${r.amount.toLocaleString()}</span>
                  <Badge variant="outline" className={r.status === "Captured" ? "border-[oklch(0.65_0.20_145)/0.5] text-[oklch(0.65_0.20_145)]" : "border-primary/40 text-primary"}>{r.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
