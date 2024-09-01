"use client";

import React, { useRef, useEffect, useState } from "react";
import StickyBar from "./Product/StickyBar";
import Options from "@/components/website/Product/Options";
import Image from "next/image";
import { CheckmarkIcon, ChevronRightIcon, TrashIcon } from "@/icons";

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
      <div className="w-[400px] h-full sticky top-0 border-l [background:linear-gradient(90deg,hsla(47,92%,95%,1)_0%,hsla(0,0%,100%,1)_100%)]">
        <div className="p-5 flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <div className="h-[72px] w-[72px] relative overflow-hidden">
              <Image
                src="/images/sample/blue-bag.png"
                alt="Shopping cart"
                width={72}
                height={72}
                priority
              />
              <span className="border border-white absolute top-[2px] right-2 min-w-[21px] w-max h-[21px] px-1 rounded-full text-sm font-medium flex items-center justify-center text-white bg-red">
                5
              </span>
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
          <div className="flex flex-col gap-2 w-[300px]">
            <button className="flex items-center justify-center w-full rounded-full cursor-pointer text-white text-sm font-semibold h-[44px] bg-[#ffc439] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] min-[896px]:text-base min-[896px]:h-12">
              <Image
                src="/images/sample/paypal.svg"
                alt="PayPal"
                width={72}
                height={72}
                priority
              />
            </button>
          </div>
          <div className="mt-6">
            <div className="flex items-center gap-3 font-medium mb-5">
              <div className="min-w-5 max-w-5 min-h-5 max-h-5 rounded-full flex items-center justify-center bg-black">
                <CheckmarkIcon className="fill-white" size={16} />
              </div>
              <span>Select all (5)</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className="min-w-5 max-w-5 min-h-5 max-h-5 rounded-full flex items-center justify-center bg-black">
                  <CheckmarkIcon className="fill-white" size={16} />
                </div>
                <div className="flex gap-2">
                  <div className="min-w-24 max-w-24 min-h-24 max-h-24 overflow-hidden flex items-center justify-center">
                    <Image
                      src="https://img.kwcdn.com/product/fancy/02d2f093-bec5-423b-bab6-438f4c685ab2.jpg?imageView2/2/w/800/q/70/format/webp"
                      alt="Low High Hem Mock Neck Sweater, Elegant Long Sleeve Sweater For Fall & Winter, Women's Clothing"
                      height={96}
                      width={96}
                      priority
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-6 flex items-center justify-between gap-1">
                      <p className="text-sm line-clamp-1">
                        Low High Hem Mock N e ck Sweater, Elegant Long Sleeve
                        Sweater For Fall & Winter, Women's Clothing
                      </p>
                      <button className="group min-w-8 max-w-8 min-h-8 max-h-8 rounded-full flex items-center justify-center ease-in-out duration-300 transition hover:bg-lightgray">
                        <TrashIcon className="fill-gray group-hover:fill-black" />
                      </button>
                    </div>
                    <button className="w-max px-2 rounded-full flex border border-[#c5c3c0] text-sm ease-in-out duration-300 transition hover:border-[#76726c]">
                      <span>Sky Blue / M</span>
                      <ChevronRightIcon className="-mr-[7px]" size={20} />
                    </button>
                    <div className="flex items-center gap-[6px]">
                      <span className="font-bold">$12.99</span>
                      <span className="text-xs text-gray line-through mt-[2px]">
                        $36.99
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
