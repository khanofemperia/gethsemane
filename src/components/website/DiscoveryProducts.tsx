import { shuffleDiscoveryProducts } from "@/lib/utils";
import { unstable_noStore as noStore } from "next/cache";
import { ProductCard } from "./ProductCard";

export function DiscoveryProducts({
  heading = "Explore Your Interests",
  products,
  cart,
  deviceIdentifier,
}: {
  heading?: string;
  products?: ProductWithUpsellType[];
  cart: CartType | null;
  deviceIdentifier: string;
}) {
  noStore(); // prevents this component from being cached

  const shuffledProducts = shuffleDiscoveryProducts([...(products || [])]);
  return (
    <div>
      <h2 className="w-[calc(100%-20px)] mx-auto mb-4 font-semibold line-clamp-3 md:text-[1.375rem] md:leading-7">
        {heading}
      </h2>
      <div className="select-none w-full flex flex-wrap gap-1 md:gap-0">
        {shuffledProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            cart={cart}
            deviceIdentifier={deviceIdentifier}
          />
        ))}
      </div>
    </div>
  );
}
