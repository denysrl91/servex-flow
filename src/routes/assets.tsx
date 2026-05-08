import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/assets")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Commercial"
      title="Assets"
      description="Asset registry for commercial equipment with QR tags and lifecycle tracking."
      features={["QR / barcode tagging","Capital vs. service assets","Depreciation & replacement cost","Service history per asset","Compliance & inspection logs"]}
      related={[{ to: "/equipment", label: "Equipment" }, { to: "/preventive-maintenance", label: "Preventive Maintenance" }]}
    />
  );
}
