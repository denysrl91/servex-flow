import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/sla")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="Commercial"
        title="SLA Management"
        description="Service-level agreements with response time tracking and breach alerts."
        features={["Response & resolution targets","Coverage windows & holidays","Breach alerts & escalations","Per-account SLA reports","Penalty / credit tracking"]}
        related={[{ to: "/commercial", label: "Commercial Accounts" }, { to: "/tickets", label: "Service Tickets" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="sla" singular="SLA" plural="SLAs" />
      </div>
    </>
  );
}
