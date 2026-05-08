import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/communications")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="CRM"
        title="Communications"
        description="Unified inbox for SMS, email, and call logs against every customer & job."
        features={["Two-way SMS & email threads","Call recordings & transcripts","Templates & automations","Per-customer activity timeline","Team @mentions & internal notes"]}
        related={[{ to: "/customers", label: "Customers" }, { to: "/notifications", label: "Notifications" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="communications" singular="Conversation" plural="Conversations" />
      </div>
    </>
  );
}
