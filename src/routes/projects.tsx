import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/projects")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Operations"
      title="Projects"
      description="Multi-day, multi-phase work orders with budgets, milestones, and Gantt timelines."
      features={["Phases & milestones","Budget vs. actual tracking","Gantt & dependencies","Multi-tech assignments","Project-level invoicing"]}
      related={[{ to: "/jobs", label: "Jobs" }, { to: "/installations", label: "Installations" }]}
    />
  );
}
