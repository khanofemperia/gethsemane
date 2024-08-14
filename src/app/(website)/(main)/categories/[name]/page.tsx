import { ProductCard } from "@/components/website/ProductCard";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import { getProductsByCategoryWithUpsell } from "@/lib/getData";

type ProductWithUpsellType = Omit<ProductType, "upsell"> & {
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      salePrice: number;
      basePrice: number;
      discountPercentage: number;
    };
    visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
    createdAt: string;
    updatedAt: string;
    products: {
      id: string;
      name: string;
      slug: string;
      mainImage: string;
      basePrice: number;
    }[];
  };
};

export default async function Categories({
  params,
}: {
  params: { name: string };
}) {
  const products = (await getProductsByCategoryWithUpsell({
    category: params.name,
  })) as ProductWithUpsellType[];

  return (
    <>
      <div className="max-w-[968px] mx-auto pt-10">
        <div className="select-none w-full flex flex-wrap gap-1 md:gap-0">
          {products.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
      </div>
      <QuickviewOverlay />
    </>
  );
}
