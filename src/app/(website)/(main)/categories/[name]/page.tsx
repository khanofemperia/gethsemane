import { ProductCard } from "@/components/website/ProductCard";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import ShowAlert from "@/components/website/ShowAlert";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { getCart, getProductsByCategoryWithUpsell } from "@/lib/getData";
import { cookies } from "next/headers";

export default async function Categories({
  params,
}: {
  params: { name: string };
}) {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";
  const cart = await getCart(deviceIdentifier);

  const products = (await getProductsByCategoryWithUpsell({
    category: params.name,
  })) as ProductWithUpsellType[];

  return (
    <>
      <div className="max-w-[968px] mx-auto pt-10">
        <div className="select-none w-full flex flex-wrap gap-1 md:gap-0">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              cart={cart}
              deviceIdentifier={deviceIdentifier}
            />
          ))}
        </div>
      </div>
      <QuickviewOverlay />
      <UpsellReviewOverlay cart={cart} />
      <ShowAlert />
    </>
  );
}
