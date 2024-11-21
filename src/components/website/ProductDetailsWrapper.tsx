"use client";

import React, { useRef, useEffect, useState } from "react";
import { StickyBar } from "./Product/StickyBar";
import Footer from "./Footer";
import { CartIcon } from "@/icons";
import Image from "next/image";
import Link from "next/link";
import { Options } from "./Product/Options";
import { useScrollStore } from "@/zustand/website/scrollStore";
import { MobileNavbarButton, MobileNavbarOverlay } from "./MobileNavbarOverlay";

export function ProductDetailsWrapper({
  children,
  cart,
  deviceIdentifier,
  hasColor,
  hasSize,
  productInfo,
  categoriesData,
}: {
  readonly children: React.ReactNode;
  cart: CartType | null;
  deviceIdentifier: string;
  hasColor: boolean;
  hasSize: boolean;
  productInfo: ProductInfoType;
  categoriesData: StoreCategoriesType | null;
}) {
  const [isCategoriesDropdownVisible, setCategoriesDropdownVisible] =
    useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setScrollPosition = useScrollStore((state) => state.setScrollPosition);
  const shouldShowBar = useScrollStore((state) => state.shouldShowBar);

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
  }, [setScrollPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node)
      ) {
        setCategoriesDropdownVisible(false);
      }
    };

    const handleScroll = () => {
      if (isCategoriesDropdownVisible) {
        setCategoriesDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isCategoriesDropdownVisible]);

  const toggleCategoriesDropdown = () => {
    setCategoriesDropdownVisible(!isCategoriesDropdownVisible);
  };

  return (
    <div
      ref={wrapperRef}
      className="h-screen overflow-x-hidden overflow-y-auto custom-scrollbar"
    >
      <nav className="w-full max-h-[116px] md:max-h-16 border-b bg-white">
        <div className="w-full max-w-[1080px] mx-auto px-6 py-2 flex items-center justify-between">
          <Link
            href="/"
            className="h-12 min-w-[168px] w-[168px] flex items-center justify-center"
          >
            <Image
              src="/images/logos/cherlygood_wordmark.svg"
              alt="Cherly Good"
              width={160}
              height={40}
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative h-12 w-12 rounded-full flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray lg:hover:bg-lightgray"
            >
              <CartIcon size={26} />
              {cart && cart.items.length > 0 && (
                <span className="absolute top-[4px] left-[30px] min-w-5 w-max h-5 px-1 rounded-full text-sm font-medium flex items-center justify-center text-white bg-red">
                  {cart.items.length}
                </span>
              )}
            </Link>
            <MobileNavbarButton />
          </div>
        </div>
      </nav>
      {children}
      <StickyBar
        productInfo={productInfo}
        optionsComponent={
          <Options
            productInfo={productInfo}
            isStickyBarInCartIndicator={true}
            deviceIdentifier={deviceIdentifier}
          />
        }
        hasColor={hasColor}
        hasSize={hasSize}
        cart={cart}
        isHidden={!shouldShowBar}
      />
      <MobileNavbarOverlay />
      <Footer />
    </div>
  );
}

// -- Type Definitions --

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
  upsell: {
    id: string;
    mainImage: string;
    pricing: PricingType;
    visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
    createdAt: string;
    updatedAt: string;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      basePrice: number;
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
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
          centimeters: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
        };
      };
    }>;
  };
};

type CategoryType = {
  index: number;
  name: string;
  image: string;
  visibility: "VISIBLE" | "HIDDEN";
};

type StoreCategoriesType = {
  showOnPublicSite: boolean;
  categories: CategoryType[];
};
