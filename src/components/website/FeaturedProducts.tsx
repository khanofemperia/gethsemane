"use client";

import Link from "next/link";
import { ProductCard } from "./ProductCard";

export function FeaturedProducts({
  collection,
  cart,
  deviceIdentifier,
}: {
  collection: EnrichedCollectionType;
  cart: CartType | null;
  deviceIdentifier: string;
}) {
  const { id, slug, title } = collection;
  const products = collection.products as (ProductWithUpsellType & {
    index: number;
  })[];

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 md:w-[calc(100%-20px)] md:mx-auto">
        <h2 className="font-semibold line-clamp-3 md:text-xl">{title}</h2>
        <Link
          href={`/collection/${slug}-${id}`}
          className="text-sm rounded-full px-3 h-8 text-nowrap flex items-center justify-center transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
        >
          See more
        </Link>
      </div>
      <div className="md:hidden overflow-hidden flex gap-2 relative select-none">
        {products.slice(0, 3).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            cart={cart}
            deviceIdentifier={deviceIdentifier}
          />
        ))}
      </div>
      <div className="hidden md:flex gap-0 relative select-none">
        {products.slice(0, 3).map((product) => (
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

// -- Type Definitions --

type EnrichedProductType = {
  index: number;
  id: string;
  name: string;
  slug: string;
  description: string;
  highlights: {
    headline: string;
    keyPoints: { index: number; text: string }[];
  };
  pricing: {
    salePrice: number;
    basePrice: number;
    discountPercentage: number;
  };
  images: {
    main: string;
    gallery: string[];
  };
  options: {
    colors: Array<{
      name: string;
      image: string;
    }>;
    sizes: {
      inches: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
      centimeters: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
    };
  };
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
      basePrice: number;
      images: {
        main: string;
        gallery: string[];
      };
    }[];
  };
};

type EnrichedCollectionType = {
  id: string;
  index: number;
  title: string;
  slug: string;
  campaignDuration: DateRangeType;
  collectionType: string;
  bannerImages?: {
    desktopImage: string;
    mobileImage: string;
  };
  products: EnrichedProductType[];
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
};
