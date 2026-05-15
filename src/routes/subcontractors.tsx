import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/subcontractors")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="Workforce"
        title="Subcontractors"
        description="Approved trade partners with insurance, payment terms, banking, and full work history."
        features={[
          "Principal contact, full address, multiple phones & emails, fax",
          "Insurance, license & workers comp tracking with expiry alerts",
          "Payment terms and ACH banking details",
          "Estimates, invoices, and paid jobs roll-up per subcontractor",
          "Approval status (Approved / Not Approved / Pending)",
          "Work history & communication log",
        ]}
        related={[
          { to: "/technicians", label: "Technicians" },
          { to: "/vendors", label: "Vendors" },
          { to: "/payroll", label: "Payroll" },
        ]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="subcontractors" singular="Subcontractor" plural="Subcontractors" />
      </div>
    </>
  );
}
