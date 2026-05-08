import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/preventive-maintenance")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Commercial"
      title="Preventive Maintenance"
      description="Recurring PM schedules with auto-generated work orders and visit tracking."
      features={["PM templates by equipment type","Auto-generated work orders","Visit cadence & seasons","Skipped-visit alerts","Compliance reporting"]}
      related={[{ to: "/assets", label: "Assets" }, { to: "/schedule", label: "Schedule" }]}
    />
  );
}
