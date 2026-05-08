import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/business-intelligence")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="Analytics"
        title="Business Intelligence"
        description="Custom report builder, dashboards, and ad-hoc data exploration."
        features={["Drag & drop report builder","Custom dashboards","Scheduled email reports","CSV / Excel export","Saved views & sharing"]}
        related={[{ to: "/reports", label: "Reports" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="business-intelligence" singular="Report" plural="BI Reports" />
      </div>
    </>
  );
}
