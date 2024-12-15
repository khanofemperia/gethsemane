import { getCart } from "@/actions/get/cart";
import { getProducts } from "@/actions/get/products";
import { Pagination } from "@/components/website/Pagination";
import { ProductCard } from "@/components/website/ProductCard";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import ShowAlert from "@/components/website/ShowAlert";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { capitalizeFirstLetter } from "@/lib/utils/common";
import { cookies } from "next/headers";
import Image from "next/image";

export default async function Categories({
  params,
  searchParams,
}: {
  params: { name: string };
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

  const allProducts =
    ((await getProducts({
      category: params.name,
      fields: productFields,
    })) as ProductWithUpsellType[]) || [];

  const itemsPerPage = 2;
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const products = allProducts.slice(startIndex, startIndex + itemsPerPage);

  const displayName = getDisplayName(params.name);

  if (!products.length) {
    return (
      <div className="flex flex-col gap-4 items-center pt-16">
        <div>
          <Image
            src="/icons/package.svg"
            alt="Package Icon"
            width={80}
            height={80}
            priority={true}
          />
        </div>
        <div className="text-center">
          <h3 className="font-semibold mb-1">We're restocking!</h3>
          <p className="text-sm text-gray">Check back soon for fresh finds</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-5 pt-8">
        <h2 className="md:w-[calc(100%-20px)] mx-auto mb-4 font-semibold line-clamp-3 md:text-xl">
          {displayName}
        </h2>
        <div>
          <div className="select-none w-full flex flex-wrap gap-2 md:gap-0">
            {products.map((product, index) => (
              <ProductCard
                key={product.id || index}
                product={product}
                cart={cart}
                deviceIdentifier={deviceIdentifier}
              />
            ))}
          </div>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
      <QuickviewOverlay />
      <UpsellReviewOverlay cart={cart} />
      <ShowAlert />
    </>
  );
}

function getDisplayName(category: string): string {
  switch (category.toLowerCase()) {
    case "men":
      return "Shop Men";
    case "catch-all":
      return "Catch-All";
    default:
      return `Women's ${capitalizeFirstLetter(category)}`;
  }
}
