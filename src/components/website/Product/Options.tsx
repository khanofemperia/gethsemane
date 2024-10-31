"use client";

import Image from "next/image";
import { ChevronRightIcon } from "@/icons";
import { useOverlayStore } from "@/zustand/website/overlayStore";
import { useEffect, useState } from "react";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import { InCartIndicator } from "./InCartIndicator";
import clsx from "clsx";
import { StickyBarInCartIndicator } from "./StickyBarInCartIndicator";
import { getCart } from "@/lib/api/cart";

type ProductColorsType = {
  colors: Array<{
    name: string;
    image: string;
  }>;
};

function ProductColors({ colors }: ProductColorsType) {
  const selectedColor = useOptionsStore((state) => state.selectedColor);
  const setSelectedColor = useOptionsStore((state) => state.setSelectedColor);

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

function ProductSizeChart({
  sizeChart,
  onSizeChartClick,
}: {
  sizeChart: SizeChartType;
  onSizeChartClick: () => void;
}) {
  const selectedSize = useOptionsStore((state) => state.selectedSize);
  const setSelectedSize = useOptionsStore((state) => state.setSelectedSize);

  const { columns, rows } = sizeChart.inches;
  const sizes = rows.map((row) => row[columns[0].label]);

  const isFeetInchFormat = (value: string) =>
    /\d+'(?:\d{1,2}")?-?\d*'?(?:\d{1,2}")?/.test(value);

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
          onClick={onSizeChartClick}
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
                    const measurement = selectedRow
                      ? selectedRow[column.label]
                      : "";

                    return (
                      <li key={column.label} className="text-nowrap">
                        <span className="text-xs text-gray">{`${column.label}: `}</span>
                        <span className="text-xs font-semibold">
                          {measurement}
                          {!isFeetInchFormat(measurement) && measurement !== ""
                            ? " in"
                            : ""}
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

export default function ProductOptions({
  productInfo,
  isStickyBarInCartIndicator,
  deviceIdentifier,
}: {
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
  isStickyBarInCartIndicator: boolean;
  deviceIdentifier: string;
}) {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [cart, setCart] = useState<CartType | null>(null);

  const selectedColor = useOptionsStore((state) => state.selectedColor);
  const selectedSize = useOptionsStore((state) => state.selectedSize);
  const isInCart = useOptionsStore((state) => state.isInCart);
  const setIsInCart = useOptionsStore((state) => state.setIsInCart);
  const setProductId = useOptionsStore((state) => state.setProductId);
  const resetOptions = useOptionsStore((state) => state.resetOptions);

  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const productDetailsPage = useOverlayStore(
    (state) => state.pages.productDetails
  );

  const hasColor = productInfo.options.colors.length > 0;
  const hasSize = Object.keys(productInfo.options.sizes).length > 0;

  useEffect(() => {
    setProductId(productInfo.id);
    resetOptions();
  }, [productInfo.id, setProductId, resetOptions]);

  useEffect(() => {
    const fetchCart = async () => {
      const cart = await getCart(deviceIdentifier);
      setCart(cart);
    };
    fetchCart();
  }, [deviceIdentifier]);

  useEffect(() => {
    setIsInCart(
      cart?.items.some((item) => {
        if (item.type === "product") {
          return (
            item.baseProductId === productInfo.id &&
            item.color === selectedColor &&
            item.size === selectedSize
          );
        }
        return false;
      }) ?? false
    );
  }, [cart, productInfo.id, selectedColor, selectedSize, setIsInCart]);

  useEffect(() => {
    const handleScroll = () => {
      if (isDropdownVisible) {
        // setDropdownVisible(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isDropdownVisible &&
        !target.closest(".dropdown-container") &&
        !target.closest(".overlay")
      ) {
        setDropdownVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownVisible]);

  const getButtonText = () => {
    if (hasColor && hasSize) {
      if (!selectedColor && !selectedSize) return "Select Color & Size";
      if (selectedColor && !selectedSize)
        return (
          <>
            <span className="text-gray">Color: </span>
            <span className="text-gray">{selectedColor} - </span>
            <span className="text-xs font-semibold">Select Size</span>
          </>
        );
      if (!selectedColor && selectedSize)
        return (
          <>
            <span className="text-gray">Size: </span>
            <span className="text-gray">{selectedSize} - </span>
            <span className="text-xs font-semibold">Select Color</span>
          </>
        );
      return (
        <>
          <span className="text-gray">Color: </span>
          <span>{selectedColor}</span>
          <span>, </span>
          <span className="text-gray">Size: </span>
          <span>{selectedSize}</span>
        </>
      );
    }
    if (hasColor) {
      return selectedColor ? (
        <>
          <span className="text-gray">Color: </span>
          <span>{selectedColor}</span>
        </>
      ) : (
        "Select Color"
      );
    }
    if (hasSize) {
      return selectedSize ? (
        <>
          <span className="text-gray">Size: </span>
          <span>{selectedSize}</span>
        </>
      ) : (
        "Select Size"
      );
    }
    return "";
  };

  const handleSizeChartClick = () => {
    showOverlay({
      pageName: productDetailsPage.name,
      overlayName: productDetailsPage.overlays.sizeChart.name,
    });
  };

  return (
    <div
      className={clsx(
        "dropdown-container w-max rounded-full relative",
        {
          "h-max flex flex-col gap-3 items-start lg:h-8 lg:flex-row lg:items-center":
            !isStickyBarInCartIndicator,
        },
        { "h-8 flex gap-3 items-center": isStickyBarInCartIndicator }
      )}
    >
      <div className="relative">
        <button
          onClick={() => setDropdownVisible((prev) => !prev)}
          className="h-8 w-max px-4 rounded-full flex items-center justify-center gap-[2px] ease-in-out duration-300 transition bg-lightgray active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
        >
          <div className="text-sm font-medium">{getButtonText()}</div>
          <ChevronRightIcon className="-mr-[8px] stroke-[#828282]" size={20} />
        </button>

        {isDropdownVisible && (
          <div className="absolute top-[42px] left-0 z-20 pb-2">
            <div className="w-max min-w-[238px] max-w-[288px] p-5 rounded-xl shadow-dropdown bg-white before:content-[''] before:w-[14px] before:h-[14px] before:bg-white before:rounded-tl-[2px] before:rotate-45 before:origin-top-left before:absolute before:-top-[10px] before:border-l before:border-t before:border-[#d9d9d9] before:left-16 min-[840px]:before:right-24">
              {hasColor && hasSize && (
                <div className="flex flex-col gap-4 select-none">
                  <ProductColors colors={productInfo.options.colors} />
                  <ProductSizeChart
                    sizeChart={productInfo.options.sizes}
                    onSizeChartClick={handleSizeChartClick}
                  />
                </div>
              )}
              {hasColor && !hasSize && (
                <ProductColors colors={productInfo.options.colors} />
              )}
              {!hasColor && hasSize && (
                <ProductSizeChart
                  sizeChart={productInfo.options.sizes}
                  onSizeChartClick={handleSizeChartClick}
                />
              )}
            </div>
          </div>
        )}
      </div>
      {isInCart &&
        !isDropdownVisible &&
        (isStickyBarInCartIndicator ? (
          <StickyBarInCartIndicator />
        ) : (
          <InCartIndicator />
        ))}
    </div>
  );
}
