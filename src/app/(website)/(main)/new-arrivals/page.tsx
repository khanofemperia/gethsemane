import React from "react";
import { cookies } from "next/headers";
import { ProductCard } from "@/components/website/ProductCard";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import ShowAlert from "@/components/website/ShowAlert";
import { getCart } from "@/lib/api/cart";
import { getProducts } from "@/lib/api/products";

export default async function NewArrivals() {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";
  const cart = await getCart(deviceIdentifier);
  const products = (await getProducts({
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

  return (
    <>
      <div className="max-w-[968px] mx-auto pt-10">
        <div className="select-none w-full flex flex-wrap gap-1 md:gap-0">
          {products?.map((product, index) => (
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
