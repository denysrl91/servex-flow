import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/notifications")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="Customer Experience"
        title="Notifications"
        description="Customer & internal notification rules across SMS, email, and push."
        features={["Tech on-the-way alerts","Appointment reminders","Invoice & payment receipts","Internal escalation rules","Templates & branding"]}
        related={[{ to: "/communications", label: "Communications" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="notifications" singular="Notification Rule" plural="Notification Rules" />
      </div>
    </>
  );
}
