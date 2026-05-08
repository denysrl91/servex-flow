import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/membership-billing")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="Sales & Billing"
        title="Membership Billing"
        description="Recurring billing engine for service plans with dunning and revenue recognition."
        features={["Monthly / annual auto-charges","Dunning & retry logic","Proration & upgrades","MRR & churn analytics","Card on file vault"]}
        related={[{ to: "/memberships", label: "Memberships" }, { to: "/payments", label: "Payments" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="membership-billing" singular="Billing Plan" plural="Billing Plans" />
      </div>
    </>
  );
}
