import { ProductCard } from "./ProductCard";
import { getProducts } from "@/lib/api/products";

export async function DiscoveryProducts({
  heading = "Explore Your Interests",
  page,
  excludeIds = [],
  cart,
  deviceIdentifier,
}: {
  heading?: string;
  page?: "HOME" | "CART";
  excludeIds?: string[];
  cart: CartType | null;
  deviceIdentifier: string;
}) {
  const fields = [
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

  const products = (await getProducts({ fields })) as ProductWithUpsellType[];

  const filteredProducts = products.filter((product) => {
    if (page === "HOME" || page === "CART") {
      return !excludeIds.includes(product.id);
    }
    return true;
  });

  return (
    <div>
      <h2 className="w-[calc(100%-20px)] mx-auto mb-4 font-semibold line-clamp-3 md:text-xl">
        {heading}
      </h2>
      <div className="select-none w-full flex flex-wrap gap-1 md:gap-0">
        {filteredProducts.map((product) => (
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
