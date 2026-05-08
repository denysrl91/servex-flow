import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/locations")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Commercial"
      title="Locations"
      description="Site directory for multi-property commercial accounts with access info."
      features={["Site directory & maps","Access codes & contacts","Per-site equipment lists","Hours of operation","Site-level service history"]}
      related={[{ to: "/commercial", label: "Commercial Accounts" }, { to: "/properties", label: "Properties" }]}
    />
  );
}
