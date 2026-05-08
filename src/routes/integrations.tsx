import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/integrations")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="System"
        title="Integrations"
        description="Connect QuickBooks, Stripe, Google, Twilio, and dozens more."
        features={["Accounting (QuickBooks / Xero)","Payments (Stripe / Square)","Calendars (Google / Outlook)","Comms (Twilio / SendGrid)","Marketing & CRM"]}
        related={[{ to: "/api-access", label: "API Access" }, { to: "/automation", label: "Automation" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="integrations" singular="Integration" plural="Integrations" />
      </div>
    </>
  );
}
