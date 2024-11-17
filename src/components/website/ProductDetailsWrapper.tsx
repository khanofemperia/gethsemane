"use client";

import React, { useRef, useEffect, useState } from "react";
import { StickyBar } from "./Product/StickyBar";
import Options from "@/components/website/Product/Options";
import Footer from "./Footer";
import { CartIcon } from "@/icons";
import Image from "next/image";
import Link from "next/link";
import { HiMiniChevronDown } from "react-icons/hi2";

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
  const [scrollPosition, setScrollPosition] = useState(0);
  const categoriesRef = useRef<HTMLDivElement>(null);
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
        <div className="w-full max-w-[1080px] mx-auto px-6 py-2 relative flex justify-between gap-1 flex-col md:flex-row">
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="h-12 min-w-[168px] w-[168px] pl-2 flex items-center"
            >
              <Image
                src="/images/logos/cherlygood_wordmark.svg"
                alt="Cherly Good"
                width={160}
                height={40}
                priority
              />
            </Link>
            <div className="flex gap-3 h-12">
              <Link
                href="/new-arrivals"
                className="hover:bg-lightgray h-12 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out"
              >
                New Arrivals
              </Link>
              {categoriesData?.showOnPublicSite &&
                categoriesData.categories.length > 0 && (
                  <div className="relative" ref={categoriesRef}>
                    <button
                      onClick={toggleCategoriesDropdown}
                      className="hover:bg-lightgray h-12 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out"
                    >
                      <span>Categories</span>
                      <HiMiniChevronDown
                        size={18}
                        className={`-mr-1 transition-transform duration-300 ${
                          isCategoriesDropdownVisible ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isCategoriesDropdownVisible && (
                      <div className="w-40 absolute top-[56px] left-0 z-20 py-2 rounded-md shadow-dropdown bg-white before:content-[''] before:w-[10px] before:h-[10px] before:bg-white before:rounded-tl-[2px] before:rotate-45 before:origin-top-left before:absolute before:-top-2 before:border-l before:border-t before:border-[#d9d9d9] before:left-12 min-[840px]:before:right-24">
                        {categoriesData.categories.map((category, index) => (
                          <Link
                            key={index}
                            href={`/category/${category.name.toLowerCase()}`}
                            className="block px-5 py-2 text-sm font-semibold transition duration-300 ease-in-out hover:bg-lightgray"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              <Link
                href="#"
                className="hover:bg-lightgray h-12 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out"
              >
                Track Order
              </Link>
            </div>
          </div>
          <div className="absolute right-4 top-2 md:relative md:right-auto md:top-auto min-w-[160px] w-[160px] h-12 flex items-center justify-end">
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
        scrollPosition={scrollPosition}
        hasColor={hasColor}
        hasSize={hasSize}
        cart={cart}
      />
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
