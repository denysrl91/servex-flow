import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/memberships")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="CRM"
        title="Memberships"
        description="Recurring service agreements with auto-renewals, visit scheduling, and price tiers."
        features={["Plan tiers (Silver / Gold / Platinum)","Auto-generated maintenance visits","Renewal & churn dashboard","Member benefits & discounts","Linked equipment coverage"]}
        related={[{ to: "/membership-billing", label: "Membership Billing" }, { to: "/customers", label: "Customers" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="memberships" singular="Membership" plural="Memberships" />
      </div>
    </>
  );
}
