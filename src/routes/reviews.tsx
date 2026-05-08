import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/reviews")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Customer Experience"
      title="Reviews"
      description="Automated review requests and reputation monitoring across Google, Yelp, and more."
      features={["Auto-request after job complete","Multi-platform monitoring","Negative-review alerts","Reply from inbox","Star rating trends"]}
      related={[{ to: "/communications", label: "Communications" }]}
    />
  );
}
