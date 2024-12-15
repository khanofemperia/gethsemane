import { getCart } from "@/actions/get/cart";
import { getCollections } from "@/actions/get/collections";
import { Pagination } from "@/components/website/Pagination";
import { ProductCard } from "@/components/website/ProductCard";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import ShowAlert from "@/components/website/ShowAlert";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { cookies } from "next/headers";

export default async function Collections({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const deviceIdentifier = cookies().get("device_identifier")?.value || "";
  const cart = await getCart(deviceIdentifier);

  const productFields = [
    "id",
    "name",
    "slug",
    "description",
    "pricing",
    "images",
    "options",
    "upsell",
    "highlights",
  ];

  const [collection] =
    (await getCollections({
      ids: [params.slug.split("-").pop() as string],
      includeProducts: true,
      fields: productFields,
    })) || [];

  const itemsPerPage = 2;
  const totalPages = Math.ceil(collection.products.length / itemsPerPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const start = (currentPage - 1) * itemsPerPage;
  const products = collection.products.slice(start, start + itemsPerPage);

  return (
    <>
      <div className="max-w-5xl mx-auto px-5 pt-8">
        <h2 className="md:w-[calc(100%-20px)] mx-auto mb-4 font-semibold line-clamp-3 md:text-xl">
          {collection.title}
        </h2>
        <div>
          {products.length > 0 ? (
            <div className="select-none w-full flex flex-wrap gap-2 md:gap-0">
              {products.filter(Boolean).map((product, index) => (
                <ProductCard
                  key={index}
                  product={product as ProductWithUpsellType & { index: number }}
                  cart={cart}
                  deviceIdentifier={deviceIdentifier}
                />
              ))}
            </div>
          ) : (
            <p className="text-center">
              No products available in this collection.
            </p>
          )}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
      <QuickviewOverlay />
      <UpsellReviewOverlay cart={cart} />
      <ShowAlert />
    </>
  );
}
