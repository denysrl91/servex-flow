import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/payroll")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Workforce"
      title="Payroll"
      description="Hours, commissions, bonuses, and deductions exported to your payroll provider."
      features={["Auto-calculated hourly + commission","Overtime & holiday rules","Bonus & spiff tracking","Export to ADP / Gusto / QuickBooks","Pay stubs & history"]}
      related={[{ to: "/time-tracking", label: "Time Tracking" }, { to: "/commissions", label: "Commissions" }]}
    />
  );
}
