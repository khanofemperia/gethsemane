import { NewProductOverlay } from "@/components/admin/NewProduct";
import ProductGrid from "@/components/admin/ProductGrid";
import { getProducts } from "@/app/data/getData";

export default async function Products() {
  const products = (await getProducts({
    fields: ["id", "name", "slug", "pricing", "images", "visibility"],
  })) as ProductType[];

  return (
    <>
      <ProductGrid products={products || []} />
      <NewProductOverlay />
    </>
  );
}
