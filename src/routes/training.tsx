import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ModuleRecords } from "@/components/module-records";

export const Route = createFileRoute("/training")({ component: Page });

function Page() {
  return (
    <>
      <ModulePlaceholder
        eyebrow="Workforce"
        title="Training"
        description="Certifications, skill matrix, and learning content for every technician."
        features={["Skill matrix by tech","Certification expiry alerts","Course library & quizzes","Required training assignments","Compliance reporting"]}
        related={[{ to: "/technicians", label: "Technicians" }]}
      />
      <div className="p-6 pt-0">
        <ModuleRecords moduleKey="training" singular="Course" plural="Training Courses" />
      </div>
    </>
  );
}
