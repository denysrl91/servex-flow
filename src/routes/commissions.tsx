import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/commissions")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Workforce"
      title="Commissions"
      description="Configurable commission plans for sales reps and technicians."
      features={["Plan templates by role","Tiered & accelerator rules","Per-line-item splits","Forecast vs. paid","Approval workflow"]}
      related={[{ to: "/payroll", label: "Payroll" }, { to: "/pipeline", label: "Sales Pipeline" }]}
    />
  );
}
