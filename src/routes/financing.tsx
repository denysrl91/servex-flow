import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/financing")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Sales & Billing"
      title="Financing"
      description="Consumer financing offers and applications integrated into the estimate flow."
      features={["Pre-qualification at the kitchen table","Multiple lender options","Monthly payment calculator on estimates","Application status tracking","Funding & dealer fee reporting"]}
      related={[{ to: "/estimates", label: "Estimates" }, { to: "/payments", label: "Payments" }]}
    />
  );
}
