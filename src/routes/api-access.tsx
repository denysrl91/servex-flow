import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/api-access")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="System"
      title="API Access"
      description="API keys, webhooks, and developer documentation."
      features={["Personal & service API keys","Webhook subscriptions","Rate limits & usage","OpenAPI / Swagger docs","Audit log of API calls"]}
      related={[{ to: "/integrations", label: "Integrations" }]}
    />
  );
}
