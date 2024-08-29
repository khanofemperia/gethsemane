import { ProductCardWrapper } from "@/components/website/ProductCardWrapper";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import { getCart, getProductsByCategoryWithUpsell } from "@/lib/getData";
import { cookies } from "next/headers";

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
      options: {
        colors: Array<{
          name: string;
          image: string;
        }>;
        sizes: {
          inches: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
          centimeters: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
        };
      };
    }[];
  };
};

type CartType = {
  id: string;
  device_identifier: string;
  products: Array<{
    id: string;
    size: string;
    color: string;
  }>;
};

export default async function Categories({
  params,
}: {
  params: { name: string };
}) {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;
  const cart = await getCart(deviceIdentifier);

  const products = (await getProductsByCategoryWithUpsell({
    category: params.name,
  })) as ProductWithUpsellType[];

  return (
    <>
      <div className="max-w-[968px] mx-auto pt-10">
        <div className="select-none w-full flex flex-wrap gap-1 md:gap-0">
          {products.map((product, index) => (
            <ProductCardWrapper
              key={index}
              product={product}
              cart={cart as CartType}
            />
          ))}
        </div>
      </div>
      <QuickviewOverlay />
    </>
  );
}
