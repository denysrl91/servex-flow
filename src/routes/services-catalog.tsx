import { createFileRoute } from "@tanstack/react-router";
import { PriceBook } from "@/components/price-book";
import { SERVICES_CATEGORIES } from "@/lib/price-book-store";

export const Route = createFileRoute("/services-catalog")({ component: ServicesCatalog });

function ServicesCatalog() {
  return (
    <PriceBook
      title="Services Price Book"
      description="Standard service pricing for repairs, maintenance, and tune-ups."
      kind="services"
      categories={SERVICES_CATEGORIES}
    />
  );
}
