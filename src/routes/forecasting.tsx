import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/forecasting")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="Analytics"
        title="Forecasting"
        description="AI-driven revenue, demand, and capacity forecasting."
        features={["Revenue forecast by service line","Seasonal demand prediction","Tech capacity planning","Inventory demand forecast","Scenario modeling"]}
        related={[{ to: "/executive-dashboard", label: "Executive Dashboard" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="forecasting" singular="Forecast" plural="Forecasts" />
      </div>
    </>
  );
}
