import { NewProductOverlay } from "@/components/admin/NewProduct";
import ProductGrid from "@/components/admin/ProductGrid";
import { getProducts } from "@/lib/getData";

export default async function Products() {
  const products = (await getProducts({
    fields: ["id", "mainImage", "name", "price", "slug", "visibility"],
  })) as ProductType[];

  return (
    <>
      <ProductGrid products={products} />
      <NewProductOverlay />
    </>
  );
}
