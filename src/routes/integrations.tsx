import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/integrations")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="System"
      title="Integrations"
      description="Connect QuickBooks, Stripe, Google, Twilio, and dozens more."
      features={["Accounting (QuickBooks / Xero)","Payments (Stripe / Square)","Calendars (Google / Outlook)","Comms (Twilio / SendGrid)","Marketing & CRM"]}
      related={[{ to: "/api-access", label: "API Access" }, { to: "/automation", label: "Automation" }]}
    />
  );
}
