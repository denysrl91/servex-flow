import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/ai-brain")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="Overview"
        title="AI Operations Brain"
        description="Predictive insights, anomaly detection, and prescriptive actions across every module."
        features={["Daily AI briefing of revenue, dispatch & inventory risk","Anomaly detection on jobs, payments and stock","Predictive maintenance recommendations","Auto-prioritized dispatch suggestions","Natural-language ask-anything search"]}
        related={[{ to: "/", label: "Dashboard" }, { to: "/reports", label: "Reports" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="ai-brain" singular="Insight" plural="AI Insights" />
      </div>
    </>
  );
}
