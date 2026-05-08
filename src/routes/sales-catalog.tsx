import { createFileRoute } from "@tanstack/react-router";
import { PriceBook } from "@/components/price-book";
import { SALES_CATEGORIES } from "@/lib/price-book-store";

export const Route = createFileRoute("/sales-catalog")({ component: SalesCatalog });

function SalesCatalog() {
  return (
    <PriceBook
      title="Sales Price Book"
      description="Equipment, install packages, and accessories sold to customers."
      kind="sales"
      categories={SALES_CATEGORIES}
    />
  );
}
