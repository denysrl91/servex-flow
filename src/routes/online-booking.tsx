import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/online-booking")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Customer Experience"
      title="Online Booking"
      description="Embeddable widget so customers can self-schedule service appointments."
      features={["Embeddable booking widget","Real-time availability","Service-type routing","Capture payment / deposit","Auto-create job & customer"]}
      related={[{ to: "/schedule", label: "Schedule" }, { to: "/customer-portal", label: "Customer Portal" }]}
    />
  );
}
