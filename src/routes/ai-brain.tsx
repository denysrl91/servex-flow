import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/ai-brain")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Overview"
      title="AI Operations Brain"
      description="Predictive insights, anomaly detection, and prescriptive actions across every module."
      features={["Daily AI briefing of revenue, dispatch & inventory risk","Anomaly detection on jobs, payments and stock","Predictive maintenance recommendations","Auto-prioritized dispatch suggestions","Natural-language ask-anything search"]}
      related={[{ to: "/", label: "Dashboard" }, { to: "/reports", label: "Reports" }]}
    />
  );
}
