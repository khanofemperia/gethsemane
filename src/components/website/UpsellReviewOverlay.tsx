"use client";

import Image from "next/image";
import { useOverlayStore } from "@/zustand/website/overlayStore";
import { useEffect, useState } from "react";
import { CheckmarkIcon, ChevronRightIcon, CloseIconThin } from "@/icons";
import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";
import clsx from "clsx";
import Link from "next/link";
import { ProductImageCarousel } from "./ProductImageCarousel";

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
  const [readyProducts, setReadyProducts] = useState<string[]>([]);
  const [showCarousel, setShowCarousel] = useState(false);
  const [selectedProductForCarousel, setSelectedProductForCarousel] =
    useState<any>(null);

  useEffect(() => {
    if (isVisible && selectedProduct) {
      setSelectedOptions({});
      setReadyProducts([]);

      const autoSelectedProducts = selectedProduct.upsell.products
        .filter(
          (product) =>
            product.options.colors.length === 0 &&
            Object.keys(product.options.sizes).length === 0
        )
        .map((product) => product.id);

      setReadyProducts(autoSelectedProducts);
    }
  }, [isVisible, selectedProduct]);

  const updateSelectedOptions = (
    productId: string,
    option: string,
    value: string
  ) => {
    const updatedOptions = {
      ...selectedOptions,
      [productId]: { ...selectedOptions[productId], [option]: value },
    };
    setSelectedOptions(updatedOptions);

    const product = selectedProduct?.upsell.products.find(
      (p) => p.id === productId
    );

    if (product) {
      const allOptionsSelected =
        (!product.options.colors.length || updatedOptions[productId].color) &&
        (!Object.keys(product.options.sizes).length ||
          updatedOptions[productId].size);

      if (allOptionsSelected && !readyProducts.includes(productId)) {
        setReadyProducts([...readyProducts, productId]);
      } else if (!allOptionsSelected && readyProducts.includes(productId)) {
        setReadyProducts(readyProducts.filter((id) => id !== productId));
      }
    }
  };

  const isProductReady = (productId: string) =>
    readyProducts.includes(productId);

  const openCarousel = (product: any) => {
    setSelectedProductForCarousel(product);
    setShowCarousel(true);
  };

  const closeCarousel = () => {
    setShowCarousel(false);
    setSelectedProductForCarousel(null);
  };

  return (
    <>
      {isVisible && selectedProduct && (
        <div className="custom-scrollbar flex justify-center py-20 w-screen h-screen overflow-x-hidden overflow-y-visible z-30 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="max-h-[764px] relative overflow-hidden shadow rounded-2xl bg-white">
            <div className="w-[600px] h-full pt-6 pb-[80px] flex flex-col relative">
              <div className="pb-3 flex justify-center">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-xl">$71.99</span>
                  <span className="text-amber font-medium">(Saved $24.00)</span>
                </div>
              </div>
              <div className="p-8 pt-4 flex flex-col gap-5 items-center custom-scrollbar overflow-x-hidden overflow-y-visible">
                {selectedProduct.upsell.products.map((product, index) => (
                  <div
                    key={index}
                    className="w-full flex gap-5 [&:not(:last-child)>div>div:last-child]:border-b [&:not(:last-child)>div>div:last-child]:pb-5"
                  >
                    <div className="w-full flex flex-start gap-5">
                      <div className="h-40 flex items-center">
                        <div
                          className={clsx(
                            "w-5 h-5 rounded-full flex items-center justify-center",
                            isProductReady(product.id)
                              ? "bg-black"
                              : "border border-gray"
                          )}
                        >
                          {isProductReady(product.id) && (
                            <CheckmarkIcon className="fill-white" size={16} />
                          )}
                        </div>
                      </div>
                      <div className="flex gap-5 w-full">
                        <div
                          className="relative h-max cursor-pointer"
                          onClick={() => openCarousel(product)}
                        >
                          <div className="min-w-40 max-w-40 min-h-40 max-h-40 overflow-hidden rounded-lg flex items-center justify-center">
                            <Image
                              src={product.mainImage}
                              alt={product.name}
                              width={160}
                              height={160}
                              priority
                            />
                          </div>
                          <button className="w-9 h-9 rounded-full absolute top-[6px] right-[6px] flex items-center justify-center bg-black/40">
                            <Image
                              src="/icons/carousel.svg"
                              alt="Carousel"
                              height={20}
                              width={20}
                              priority
                            />
                          </button>
                        </div>
                        <div className="w-full flex flex-col gap-4">
                          <div>
                            <Link
                              href={`${product.slug}-${product.id}`}
                              target="_blank"
                              className="text-sm line-clamp-1 w-max flex items-center gap-1"
                            >
                              <span>{product.name}</span>
                              <ChevronRightIcon
                                size={18}
                                className="stroke-gray"
                              />
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
                  </div>
                ))}
              </div>
              <div className="absolute left-0 right-0 bottom-0">
                <div className="h-[80px] px-8 flex items-start shadow-[0_-12px_16px_2px_white]">
                  <div className="w-full flex justify-between items-center">
                    <div className="flex gap-5">
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                          <CheckmarkIcon className="fill-white" size={16} />
                        </div>
                      </div>
                      <span className="font-semibold">
                        Confirm selections ({readyProducts.length})
                      </span>
                    </div>
                    <button
                      className={clsx(
                        "flex items-center justify-center w-max h-12 px-8 rounded-full border border-[#b27100] text-white font-semibold shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]",
                        readyProducts.length ===
                          selectedProduct.upsell.products.length
                          ? "cursor-pointer hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
                          : "opacity-50 cursor-context-menu"
                      )}
                      disabled={
                        readyProducts.length !==
                        selectedProduct.upsell.products.length
                      }
                    >
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
      )}
      {showCarousel && selectedProductForCarousel && (
        <ProductImageCarousel
          product={selectedProductForCarousel}
          onClose={closeCarousel}
        />
      )}
    </>
  );
}
