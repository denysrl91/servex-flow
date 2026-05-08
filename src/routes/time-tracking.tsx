import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/time-tracking")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Workforce"
      title="Time Tracking"
      description="Mobile clock-in/out, job-level time, GPS verification and timesheets."
      features={["Mobile clock-in / out","Job & task time","GPS & geofence verification","Timesheet approvals","Overtime alerts"]}
      related={[{ to: "/technicians", label: "Technicians" }, { to: "/payroll", label: "Payroll" }]}
    />
  );
}
