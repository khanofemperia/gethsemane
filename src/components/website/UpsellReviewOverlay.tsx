"use client";

import Image from "next/image";
import { useOverlayStore } from "@/zustand/website/overlayStore";
import { useCallback, useEffect, useState } from "react";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import { ChevronRightIcon, CloseIconThin } from "@/icons";
import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";

type UpsellReviewProductType = {
  id: string;
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

type ProductColorsType = {
  colors: Array<{
    name: string;
    image: string;
  }>;
};

type ProductOptionsType = {
  cartInfo: {
    isInCart: boolean;
    productInCart: {
      id: string;
      color: string;
      size: string;
    } | null;
  };
  productInfo: {
    id: string;
    name: string;
    pricing: {
      basePrice: number;
      salePrice?: number;
      discountPercentage?: number;
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
      sizes: SizeChartType;
    };
  };
};

function ProductColors({ colors }: ProductColorsType) {
  const { selectedColor, setSelectedColor } = useOptionsStore();

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3">
        {colors.map(({ name, image }, index) => (
          <div
            onClick={() => setSelectedColor(name)}
            key={index}
            className={`relative w-[40px] h-[40px] flex items-center justify-center cursor-pointer hover:before:content-[''] hover:before:h-12 hover:before:w-12 hover:before:absolute hover:before:rounded-[6px] hover:before:border hover:before:border-black ${
              selectedColor === name &&
              "before:content-[''] before:h-12 before:w-12 before:absolute before:rounded-[6px] before:border before:border-blue hover:before:!border-blue"
            }`}
          >
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-lightgray border rounded">
              <Image src={image} alt={name} width={40} height={40} priority />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductSizeChart({ sizeChart }: { sizeChart: SizeChartType }) {
  const { selectedSize, setSelectedSize } = useOptionsStore();
  const { showOverlay } = useOverlayStore();
  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.productDetails.name,
    overlayName: state.pages.productDetails.overlays.sizeChart.name,
  }));

  const { columns, rows } = sizeChart.inches;
  const sizes = rows.map((row) => row[columns[0].label]);

  return (
    <div className="w-full">
      <div className="w-full max-w-[298px] flex flex-wrap gap-[10px]">
        {sizes.map((size, index) => (
          <div key={index} className="relative cursor-pointer">
            <div
              onClick={() => setSelectedSize(size)}
              className={`font-medium border rounded-full relative px-4 h-7 flex items-center justify-center hover:border-black ${
                selectedSize === size &&
                "border-white hover:border-white before:border before:border-blue before:content-[''] before:h-8 before:w-[calc(100%_+_8px)] before:absolute before:rounded-full"
              }`}
            >
              {size}
            </div>
          </div>
        ))}
      </div>
      {selectedSize && (
        <div
          onClick={() => {
            showOverlay({ pageName, overlayName });
          }}
          className="w-full py-3 pl-[14px] pr-8 mt-2 rounded-lg relative cursor-pointer bg-lightgray"
        >
          <div>
            {rows.find((row) => row[columns[0].label] === selectedSize) && (
              <ul className="leading-3 max-w-[calc(100%-20px)] flex flex-row flex-wrap gap-2">
                {columns
                  .filter(
                    (column) =>
                      // Exclude "Size" column and specified measurements
                      column.label !== "Size" &&
                      !["US", "EU", "UK", "NZ", "AU", "DE"].includes(
                        column.label
                      )
                  )
                  .sort((a, b) => a.order - b.order)
                  .map((column) => {
                    const selectedRow = rows.find(
                      (row) => row[columns[0].label] === selectedSize
                    );
                    return (
                      <li key={column.label} className="text-nowrap">
                        <span className="text-xs text-gray">{`${column.label}: `}</span>
                        <span className="text-xs font-semibold">
                          {`${selectedRow ? selectedRow[column.label] : ""}in`}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
          <ChevronRightIcon
            className="absolute top-[50%] -translate-y-1/2 right-[6px] stroke-[#828282]"
            size={20}
          />
        </div>
      )}
    </div>
  );
}

export function UpsellReviewButton({
  product,
}: {
  product: UpsellReviewProductType;
}) {
  const { showOverlay } = useUpsellReviewStore();
  const setSelectedProduct = useUpsellReviewStore(
    (state) => state.setSelectedProduct
  );

  const openOverlay = () => {
    setSelectedProduct(product);
    showOverlay();
  };

  return (
    <button
      type="button"
      onClick={openOverlay}
      className="text-sm min-[896px]:text-base inline-block text-center align-middle h-[44px] min-[896px]:h-12 w-full border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-300 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]"
    >
      Yes, Let's Upgrade
    </button>
  );
}

export function UpsellReviewOverlay() {
  const { hideOverlay } = useUpsellReviewStore();

  const { isOverlayOpened } = useUpsellReviewStore((state) => ({
    isOverlayOpened: state.isVisible,
  }));

  const { selectedProduct } = useUpsellReviewStore((state) => ({
    selectedProduct: state.selectedProduct,
  }));

  const isVisible = isOverlayOpened && selectedProduct;

  return (
    isVisible && (
      <div className="custom-scrollbar flex justify-center py-20 w-screen h-screen overflow-x-hidden overflow-y-visible z-30 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
        <div className="max-h-[764px] relative overflow-hidden shadow rounded-2xl bg-white">
          <div className="w-[764px] h-full pt-8 pb-[85px] flex flex-col relative">
            <div className="mb-2">
              <div className="w-max mx-auto flex gap-y-1 gap-x-3 *:w-7 *:h-7 *:rounded-full *:bg-lightgray *:flex *:items-center *:justify-center *:text-xs">
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
              </div>
            </div>
            <div className="px-8 pt-3 flex flex-wrap gap-2 justify-center custom-scrollbar overflow-x-hidden overflow-y-visible">
              {selectedProduct.upsell.products.map((product, index) => {
                const hasColor = product.options.colors.length > 0;
                const hasSize = Object.keys(product.options.sizes).length > 0;

                return (
                  <div key={index} className="w-56 border p-2 pb-4 rounded-2xl">
                    <div className="mb-2 w-full aspect-square rounded-xl overflow-hidden">
                      <Image
                        src={product.mainImage}
                        alt={product.name}
                        width={224}
                        height={224}
                        priority={true}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray">{product.name}</span>
                    </div>
                    <div className="mt-4">
                      {hasColor && hasSize && (
                        <div className="flex flex-col gap-4 select-none">
                          <ProductColors colors={product.options.colors} />
                          <ProductSizeChart sizeChart={product.options.sizes} />
                        </div>
                      )}
                      {hasColor && !hasSize && (
                        <ProductColors colors={product.options.colors} />
                      )}
                      {!hasColor && hasSize && (
                        <ProductSizeChart sizeChart={product.options.sizes} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute left-0 right-0 bottom-0">
              <div className="h-[85px] pt-2 flex justify-center">
                <button className="h-12 w-max px-20 inline-block text-center align-middle border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-300 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]">
                  All Set! Add Upgrade to Cart
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={hideOverlay}
            className="w-9 h-9 rounded-full absolute top-[6px] right-[6px] flex items-center justify-center ease-in-out transition duration-300 hover:bg-lightgray"
          >
            <CloseIconThin size={24} className="stroke-gray" />
          </button>
        </div>
      </div>
    )
  );
}
