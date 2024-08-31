"use client";

import React, { useRef, useEffect, useState } from "react";
import StickyBar from "./Product/StickyBar";
import Options from "@/components/website/Product/Options";
import Image from "next/image";

type UpsellProductType = {
  id: string;
  name: string;
  slug: string;
  mainImage: string;
  basePrice: number;
};

type PricingType = {
  salePrice: number;
  basePrice: number;
  discountPercentage: number;
};

type UpsellType = {
  id: string;
  mainImage: string;
  pricing: PricingType;
  visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
  createdAt: string;
  updatedAt: string;
  products: UpsellProductType[];
};

type ProductInfoType = {
  id: string;
  name: string;
  pricing: PricingType;
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
  upsell: UpsellType;
};

export function ProductDetailsWrapper({
  children,
  inCart,
  cartProducts,
  hasColor,
  hasSize,
  productInfo,
}: {
  readonly children: React.ReactNode;
  inCart: boolean;
  cartProducts: Array<{
    id: string;
    color: string;
    size: string;
  }>;
  hasColor: boolean;
  hasSize: boolean;
  productInfo: ProductInfoType;
}) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (wrapperRef.current) {
        setScrollPosition(wrapperRef.current.scrollTop);
      }
    };

    const wrapperElement = wrapperRef.current;
    if (wrapperElement) {
      wrapperElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (wrapperElement) {
        wrapperElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="h-screen flex overflow-x-hidden overflow-y-auto custom-scrollbar"
    >
      <div className="relative">
        {children}
        <StickyBar
          productInfo={productInfo}
          optionsComponent={
            <Options
              inCart={inCart}
              cartProducts={cartProducts}
              productInfo={productInfo}
            />
          }
          scrollPosition={scrollPosition}
          hasColor={hasColor}
          hasSize={hasSize}
          inCart={inCart}
          cartProducts={cartProducts}
        />
      </div>
      <div className="w-[360px] h-full sticky top-0 border-l [background:linear-gradient(90deg,hsla(47,92%,95%,1)_0%,hsla(0,0%,100%,1)_100%)]">
        <div className="p-5">
          <div className="flex gap-2 items-center">
            <div className="h-[72px] w-[72px] overflow-hidden">
              <Image
                src="/images/sample/blue-bag.png"
                alt="Shopping cart"
                width={72}
                height={72}
                priority
              />
            </div>
            <div className="h-max flex flex-col">
              <div className="h-max flex gap-[6px] text-xl">
                <span>Total</span>
                <span className="font-semibold">$61.99</span>
              </div>
              <div className="flex gap-[6px] text-sm text-amber-dimmed">
                <span>You saved:</span>
                <span className="font-semibold">$27.99</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
