import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/forecasting")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Analytics"
      title="Forecasting"
      description="AI-driven revenue, demand, and capacity forecasting."
      features={["Revenue forecast by service line","Seasonal demand prediction","Tech capacity planning","Inventory demand forecast","Scenario modeling"]}
      related={[{ to: "/executive-dashboard", label: "Executive Dashboard" }]}
    />
  );
}
