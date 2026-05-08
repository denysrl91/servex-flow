import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/fleet")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Operations"
      title="Fleet"
      description="Vehicle tracking, maintenance, fuel, and driver scorecards."
      features={["Live GPS tracking","Maintenance schedules & alerts","Fuel & mileage logs","Driver behavior scorecards","Van-to-tech assignments"]}
      related={[{ to: "/inventory/vans", label: "Van Inventory" }, { to: "/dispatch", label: "Dispatch Board" }]}
    />
  );
}
