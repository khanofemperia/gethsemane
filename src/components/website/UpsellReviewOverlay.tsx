"use client";

import Image from "next/image";
import { useOverlayStore } from "@/zustand/website/overlayStore";
import { useState } from "react";
import { CheckmarkIcon, ChevronRightIcon, CloseIconThin } from "@/icons";
import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";
import clsx from "clsx";
import Link from "next/link";

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
  selectedColor: string;
  onColorSelect: (color: string) => void;
};

function ProductColors({
  colors,
  selectedColor,
  onColorSelect,
}: ProductColorsType) {
  return (
    <div className="max-w-[280px]">
      <div className="flex flex-wrap gap-2">
        {colors.map(({ name, image }, index) => (
          <div
            onClick={() => onColorSelect(name)}
            key={index}
            className={clsx(
              "relative w-[40px] h-[40px] flex items-center justify-center rounded cursor-pointer overflow-hidden",
              { "hover:shadow-[0_0_0_1.4px_#262626]": selectedColor !== name },
              { "shadow-[0_0_0_1.4px_#0a5ddc]": selectedColor === name }
            )}
          >
            <Image src={image} alt={name} width={40} height={40} priority />
          </div>
        ))}
      </div>
    </div>
  );
}

type SizeChartType = {
  inches: {
    columns: Array<{ label: string; order: number }>;
    rows: Array<{ [key: string]: string }>;
  };
  centimeters: {
    columns: Array<{ label: string; order: number }>;
    rows: Array<{ [key: string]: string }>;
  };
};

type ProductSizeChartProps = {
  sizeChart: SizeChartType;
  selectedSize: string;
  onSizeSelect: (size: string) => void;
};

function ProductSizeChart({
  sizeChart,
  selectedSize,
  onSizeSelect,
}: ProductSizeChartProps) {
  const { showOverlay } = useOverlayStore();
  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.productDetails.name,
    overlayName: state.pages.productDetails.overlays.sizeChart.name,
  }));

  const { columns, rows } = sizeChart.inches;
  const sizes = rows.map((row) => row[columns[0].label]);

  return (
    <div className="w-full">
      <div className="w-full max-w-[298px] flex flex-wrap gap-2">
        {sizes.map((size, index) => (
          <div key={index} className="relative cursor-pointer">
            <div
              onClick={() => onSizeSelect(size)}
              className={clsx(
                "font-medium border rounded-full relative px-4 h-7 flex items-center justify-center hover:border-black",
                { "border-blue hover:border-blue": selectedSize === size }
              )}
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

type ProductOptionsProps = {
  product: {
    options: {
      colors: Array<{
        name: string;
        image: string;
      }>;
      sizes: SizeChartType;
    };
  };
  selectedOptions: {
    color?: string;
    size?: string;
  };
  onOptionSelect: (option: string, value: string) => void;
};

function ProductOptions({
  product,
  selectedOptions,
  onOptionSelect,
}: ProductOptionsProps) {
  const hasColor = product.options.colors.length > 0;
  const hasSize = Object.keys(product.options.sizes).length > 0;

  return (
    <div className="flex flex-col gap-4 select-none">
      {hasColor && (
        <ProductColors
          colors={product.options.colors}
          selectedColor={selectedOptions.color || ""}
          onColorSelect={(color) => onOptionSelect("color", color)}
        />
      )}
      {hasSize && (
        <ProductSizeChart
          sizeChart={product.options.sizes}
          selectedSize={selectedOptions.size || ""}
          onSizeSelect={(size) => onOptionSelect("size", size)}
        />
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
      className="text-sm min-[896px]:text-base inline-block text-center align-middle h-[44px] min-[896px]:h-12 w-full border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-100 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]"
    >
      Yes, Let's Upgrade
    </button>
  );
}

export function UpsellReviewOverlay() {
  const { hideOverlay, isVisible, selectedProduct } = useUpsellReviewStore();
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: { color?: string; size?: string };
  }>({});

  const updateSelectedOptions = (
    productId: string,
    option: string,
    value: string
  ) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [option]: value },
    }));
  };

  const isProductReady = (
    product: UpsellReviewProductType["upsell"]["products"][number]
  ) => {
    const productOptions = selectedOptions[product.id] || {};
    const hasColor = product.options.colors.length > 0;
    const hasSize = Object.keys(product.options.sizes).length > 0;

    if (!hasColor && !hasSize) return true;
    if (hasColor && !productOptions.color) return false;
    if (hasSize && !productOptions.size) return false;
    return true;
  };

  return (
    isVisible &&
    selectedProduct && (
      <div className="custom-scrollbar flex justify-center py-20 w-screen h-screen overflow-x-hidden overflow-y-visible z-30 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
        <div className="max-h-[764px] relative overflow-hidden shadow rounded-2xl bg-white">
          <div className="w-max h-full pt-6 pb-[80px] flex flex-col relative">
            {/* <h2 className="font-semibold text-center mb-5">Order upgrade</h2> */}
            <div className="px-8 mb-5 flex gap-5">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                  <CheckmarkIcon className="fill-white" size={16} />
                </div>
              </div>
              <span className="font-semibold">Select all (3)</span>
            </div>
            <div className="px-8 pb-5 flex flex-col gap-5 items-center custom-scrollbar overflow-x-hidden overflow-y-visible">
              {selectedProduct.upsell.products.map((product, index) => (
                // <div
                //   key={product.id}
                //   className="w-[522px] flex gap-5 border p-2 pr-5 rounded-2xl"
                // >
                //   <div className="min-w-36 max-w-36 min-h-36 max-h-36 rounded-xl overflow-hidden">
                //     <Image
                //       src={product.mainImage}
                //       alt={product.name}
                //       width={160}
                //       height={160}
                //       priority={true}
                //     />
                //   </div>
                //   <div className="mt-1 flex flex-col gap-4">
                //     <p className="text-sm text-gray">{product.name}</p>
                //     <ProductOptions
                //       product={product}
                //       selectedOptions={selectedOptions[product.id] || {}}
                //       onOptionSelect={(option: string, value: string) =>
                //         updateSelectedOptions(product.id, option, value)
                //       }
                //     />
                //   </div>
                // </div>
                <div key={index} className="w-full flex gap-5">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <CheckmarkIcon className="fill-white" size={16} />
                    </div>
                  </div>
                  <div className="w-full flex gap-5 border-b pb-5">
                    <div className="min-w-32 max-w-32 min-h-32 max-h-32 relative">
                      <div className="w-full h-full overflow-hidden flex items-center justify-center">
                        <Image
                          src={product.mainImage}
                          alt={product.name}
                          width={128}
                          height={128}
                          priority
                        />
                      </div>
                      <button className="w-9 h-9 rounded-full absolute top-1 right-1 flex items-center justify-center bg-black/35">
                        <svg
                          aria-label="Carousel"
                          // class="x1lliihq x1n2onr6 x9bdzbf"
                          fill="currentColor"
                          height="20"
                          role="img"
                          viewBox="0 0 48 48"
                          width="20"
                        >
                          <title>Carousel</title>
                          <path
                            fill="white"
                            d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"
                          ></path>
                        </svg>
                      </button>
                    </div>
                    <div className="w-full flex flex-col gap-[14px]">
                      <div>
                        <Link
                          href={`${product.slug}-${product.id}`}
                          target="_blank"
                          className="text-sm line-clamp-1 w-max flex items-center gap-1"
                        >
                          <span>{product.name}</span>
                          <ChevronRightIcon size={18} className="stroke-gray" />
                        </Link>
                        <span className="text-sm line-through">$56.99</span>
                      </div>
                      <ProductOptions
                        product={product}
                        selectedOptions={selectedOptions[product.id] || {}}
                        onOptionSelect={(option: string, value: string) =>
                          updateSelectedOptions(product.id, option, value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute left-0 right-0 bottom-0">
              <div className="h-[80px] px-8 flex items-start shadow-[0_-12px_16px_2px_white]">
                <div className="w-full flex justify-between items-center">
                  <div className="mt-1 flex items-center gap-1">
                    <span className="font-semibold text-xl">$71.99</span>
                    <span className="text-amber font-medium">
                      (Saved $24.00)
                    </span>
                  </div>
                  <button className="cursor-not-allowed h-12 w-max px-8 inline-block text-center align-middle border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-100 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]">
                    All Set! Add Upgrade to Cart
                  </button>
                </div>
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
