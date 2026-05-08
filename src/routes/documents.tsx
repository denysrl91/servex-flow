import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/documents")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="CRM"
      title="Documents"
      description="Centralized file vault for proposals, photos, warranties, and signed agreements."
      features={["Drag & drop uploads with tagging","Customer / property / job linkage","Signed e-docs & version history","Smart folders & filters","Secure share links"]}
      related={[{ to: "/customers", label: "Customers" }, { to: "/estimates", label: "Estimates" }]}
    />
  );
}
