import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/automation")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="System"
      title="Automation"
      description="No-code workflow builder for triggers, conditions, and actions."
      features={["Trigger library (job created, paid, etc.)","Conditional branches","Multi-step actions","Run history & debugging","Template gallery"]}
      related={[{ to: "/integrations", label: "Integrations" }, { to: "/notifications", label: "Notifications" }]}
    />
  );
}
