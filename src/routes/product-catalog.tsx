import { createFileRoute } from "@tanstack/react-router";
import { PriceBook } from "@/components/price-book";
import { SALES_CATEGORIES } from "@/lib/price-book-store";

export const Route = createFileRoute("/product-catalog")({ component: ProductCatalog });

function ProductCatalog() {
  return (
    <PriceBook
      title="Product Catalog"
      description="All products available for sale — equipment, install packages, and accessories."
      kind="sales"
      categories={SALES_CATEGORIES}
    />
  );
}
