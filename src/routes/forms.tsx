import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/forms")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="Operations"
        title="Forms & Checklists"
        description="Custom mobile forms, safety checklists, and inspection reports for the field."
        features={["Drag & drop form builder","Conditional logic & required fields","Photo capture & signatures","PDF export & customer email","Per-job-type templates"]}
        related={[{ to: "/jobs", label: "Jobs" }, { to: "/tickets", label: "Service Tickets" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="forms" singular="Form" plural="Forms & Checklists" />
      </div>
    </>
  );
}
