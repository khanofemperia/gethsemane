import { Pagination } from "@/components/website/Pagination";
import { ProductCard } from "@/components/website/ProductCard";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import ShowAlert from "@/components/website/ShowAlert";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { getCart } from "@/lib/api/cart";
import { getProducts } from "@/lib/api/products";
import { cookies } from "next/headers";

export default async function NewArrivals({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const deviceIdentifier = cookies().get("device_identifier")?.value || "";
  const cart = await getCart(deviceIdentifier);

  const allProducts = (await getProducts({
    fields: [
      "id",
      "name",
      "slug",
      "description",
      "pricing",
      "images",
      "options",
      "upsell",
      "highlights",
    ],
  })) as ProductWithUpsellType[];

  const itemsPerPage = 2;
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const start = (currentPage - 1) * itemsPerPage;
  const products = allProducts.slice(start, start + itemsPerPage);

  return (
    <>
      <div className="max-w-[968px] mx-auto pt-10">
        {products && (
          <div className="select-none w-full flex flex-wrap gap-1 md:gap-0">
            {products.map((product, index) => (
              <ProductCard
                key={product.id || index}
                product={product}
                cart={cart}
                deviceIdentifier={deviceIdentifier}
              />
            ))}
          </div>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
      <QuickviewOverlay />
      <UpsellReviewOverlay cart={cart} />
      <ShowAlert />
    </>
  );
}
