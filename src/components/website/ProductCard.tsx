"use client";

import { QuickviewButton } from "@/components/website/QuickviewOverlay";
import { formatThousands } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

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

export function ProductCard({
  product,
  cart,
}: {
  product: ProductWithUpsellType;
  cart: CartType;
}) {
  const productsInCart =
    cart?.products.filter(
      (item: { id: string; color: string; size: string }) =>
        item.id === product.id
    ) || [];
  const inCart = productsInCart.length > 0;

  return (
    <div className="min-w-[244px] w-[244px] md:min-w-[33.333333%] md:w-[33.333333%] p-[10px] cursor-pointer rounded-2xl ease-in-out duration-300 transition hover:shadow-[0px_0px_4px_rgba(0,0,0,0.35)]">
      <Link
        href={`/${product.slug}-${product.id}`}
        className="w-full aspect-square rounded-xl flex items-center justify-center overflow-hidden bg-white"
      >
        <Image
          src={product.images.main}
          alt={product.name}
          width={1000}
          height={1000}
          priority={true}
        />
      </Link>
      <div className="pt-[10px] flex flex-col gap-[6px]">
        <p className="text-sm line-clamp-1">{product.name}</p>
        <div className="flex items-center justify-between w-full">
          <div className="w-max flex items-center justify-center">
            {Number(product.pricing.salePrice) ? (
              <div className="flex items-center gap-[6px]">
                <span className="font-medium">
                  ${formatThousands(Number(product.pricing.salePrice))}
                </span>
                <span className="text-xs text-gray line-through mt-[2px]">
                  ${formatThousands(Number(product.pricing.basePrice))}
                </span>
                <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-[10px] px-[5px] flex items-center justify-center">
                  -{product.pricing.discountPercentage}%
                </span>
              </div>
            ) : (
              <p className="font-medium">
                ${formatThousands(Number(product.pricing.basePrice))}
              </p>
            )}
          </div>
          <QuickviewButton
            onClick={(event) => event.stopPropagation()}
            product={product}
            inCart={inCart}
            cartProducts={productsInCart}
          />
        </div>
      </div>
    </div>
  );
}
