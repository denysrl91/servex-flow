import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/customer-portal")({ component: Page });

function Page() {
  return (
    <ModulePlaceholder
      eyebrow="Customer Experience"
      title="Customer Portal"
      description="Self-service portal for customers to view jobs, invoices, and equipment."
      features={["View upcoming visits","Pay invoices online","Equipment & warranty info","Document downloads","Request service"]}
      related={[{ to: "/customers", label: "Customers" }, { to: "/online-booking", label: "Online Booking" }]}
    />
  );
}
