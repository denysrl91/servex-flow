import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/vendors")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="Inventory"
        title="Vendors"
        description="Supplier directory with pricing, lead times, terms, and PO history."
        features={["Vendor profiles & contacts","Per-vendor catalog & pricing","Lead time tracking","Purchase history & spend","Preferred vendor flags"]}
        related={[{ to: "/purchase-orders", label: "Purchase Orders" }, { to: "/inventory", label: "Inventory" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="vendors" singular="Vendor" plural="Vendors" />
      </div>
    </>
  );
}
