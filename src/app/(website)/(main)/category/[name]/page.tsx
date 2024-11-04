import { ProductCard } from "@/components/website/ProductCard";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import ShowAlert from "@/components/website/ShowAlert";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { getCart } from "@/lib/api/cart";
import { getProducts } from "@/lib/api/products";
import { cookies } from "next/headers";

export default async function Categories({
  params,
}: {
  params: { name: string };
}) {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";
  const cart = await getCart(deviceIdentifier);

  const products = await getProducts({
    category: params.name,
  });

  return (
    <>
      <div className="max-w-[968px] mx-auto pt-10">
        {products && Array.isArray(products) && (
          <div className="select-none w-full flex flex-wrap gap-1 md:gap-0">
            {products
              .filter(
                (product): product is ProductWithUpsellType => product !== null
              )
              .map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  cart={cart}
                  deviceIdentifier={deviceIdentifier}
                />
              ))}
          </div>
        )}
      </div>
      <QuickviewOverlay />
      <UpsellReviewOverlay cart={cart} />
      <ShowAlert />
    </>
  );
}
