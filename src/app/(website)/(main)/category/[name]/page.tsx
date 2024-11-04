import { ProductCard } from "@/components/website/ProductCard";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import ShowAlert from "@/components/website/ShowAlert";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { getCart } from "@/lib/api/cart";
import { getProducts } from "@/lib/api/products";
import clsx from "clsx";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Categories({
  params,
  searchParams,
}: {
  params: { name: string };
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const itemsPerPage = 2;

  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";
  const cart = await getCart(deviceIdentifier);

  const allProducts = await getProducts({
    category: params.name,
  });

  const validProducts = allProducts ?? [];
  const totalProducts = validProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));

  // Ensure page is within valid range
  const validPage = Math.max(1, Math.min(page, totalPages));

  // Calculate slice indices
  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get products for current page
  const paginatedProducts = validProducts.slice(startIndex, endIndex);

  return (
    <>
      <div className="max-w-[968px] mx-auto pt-10">
        <div className="select-none w-full flex flex-wrap gap-1 md:gap-0">
          {paginatedProducts
            .filter(
              (product): product is ProductWithUpsellType =>
                product !== null && "upsell" in product
            )
            .map((product, index) => (
              <ProductCard
                key={product.id || index}
                product={product}
                cart={cart}
                deviceIdentifier={deviceIdentifier}
              />
            ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-8 mb-12">
            <div className="w-max mx-auto flex gap-1 h-9">
              <Link
                href={`/category/${params.name}?page=${validPage - 1}`}
                className={clsx(
                  "w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition",
                  {
                    "pointer-events-none opacity-50": validPage === 1,
                    "active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed":
                      validPage !== 1,
                  }
                )}
              >
                <ChevronLeftIcon className="-ml-[2px]" size={24} />
              </Link>
              <div className="min-w-[36px] max-w-[36px] h-9 px-1 flex items-center justify-center border rounded-full bg-white">
                {validPage}
              </div>
              <div className="flex items-center justify-center px-1">of</div>
              <div className="min-w-[36px] max-w-[36px] h-9 px-1 flex items-center justify-center border rounded-full bg-white">
                {totalPages}
              </div>
              <Link
                href={`/category/${params.name}?page=${validPage + 1}`}
                className={clsx(
                  "w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition",
                  {
                    "pointer-events-none opacity-50": validPage === totalPages,
                    "active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed":
                      validPage !== totalPages,
                  }
                )}
              >
                <ChevronRightIcon className="-mr-[2px]" size={24} />
              </Link>
            </div>
          </div>
        )}
      </div>
      <QuickviewOverlay />
      <UpsellReviewOverlay cart={cart} />
      <ShowAlert />
    </>
  );
}
