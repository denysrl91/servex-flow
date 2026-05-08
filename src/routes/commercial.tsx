import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/commercial")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="Commercial"
        title="Commercial Accounts"
        description="Multi-location commercial customers with portfolio-level reporting."
        features={["Parent / child account hierarchy","Consolidated billing","Portfolio dashboards","Account manager assignment","Custom pricing & terms"]}
        related={[{ to: "/locations", label: "Locations" }, { to: "/sla", label: "SLA Management" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="commercial" singular="Account" plural="Commercial Accounts" />
      </div>
    </>
  );
}
