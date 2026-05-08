import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/executive-dashboard")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Analytics"
      title="Executive Dashboard"
      description="C-suite KPIs across revenue, margin, dispatch efficiency, and customer health."
      features={["Revenue & margin by segment","Tech utilization & efficiency","CSAT & NPS","Cash position & AR aging","Goal tracking vs. plan"]}
      related={[{ to: "/reports", label: "Reports" }, { to: "/forecasting", label: "Forecasting" }]}
    />
  );
}
