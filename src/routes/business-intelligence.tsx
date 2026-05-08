import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/business-intelligence")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Analytics"
      title="Business Intelligence"
      description="Custom report builder, dashboards, and ad-hoc data exploration."
      features={["Drag & drop report builder","Custom dashboards","Scheduled email reports","CSV / Excel export","Saved views & sharing"]}
      related={[{ to: "/reports", label: "Reports" }]}
    />
  );
}
