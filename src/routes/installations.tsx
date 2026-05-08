import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/installations")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="Operations"
        title="Installations"
        description="Equipment install workflows with permits, change orders, and commissioning checklists."
        features={["Equipment selection from price book","Permit tracking","Change orders","Commissioning checklists","Warranty registration"]}
        related={[{ to: "/projects", label: "Projects" }, { to: "/equipment", label: "Equipment" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="installations" singular="Installation" plural="Installations" />
      </div>
    </>
  );
}
