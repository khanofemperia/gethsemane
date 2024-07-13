"use client";
import Image from "next/image";
import { ChevronRightIcon } from "@/icons";
import { useOverlayStore } from "@/zustand/website/overlayStore";
import { useEffect, useState } from "react";
import { useOptionsStore } from "@/zustand/website/optionsStore";

type ColorType = {
  name: string;
  image: string;
};

type ProductColorsType = {
  colors: ColorType[];
};

type ProductSizeChartType = {
  sizeChart: SizeChartType;
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
              "before:content-[''] before:h-12 before:w-12 before:absolute before:rounded-[6px] before:border before:border-custom-blue hover:before:!border-custom-blue"
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

function ProductSizeChart({ sizeChart }: ProductSizeChartType) {
  const { showOverlay } = useOverlayStore();
  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.productDetails.name,
    overlayName: state.pages.productDetails.overlays.sizeChart.name,
  }));

  const { selectedSize, setSelectedSize } = useOptionsStore();

  return (
    <div className="w-full">
      <div className="w-full max-w-[298px] flex flex-wrap gap-[10px]">
        {sizeChart.entryLabels.map((size, index) => (
          <div key={index} className="relative cursor-pointer">
            <div
              onClick={() => setSelectedSize(size.name)}
              className={`font-medium border rounded-full relative px-4 h-7 flex items-center justify-center hover:border-black ${
                selectedSize === size.name &&
                "border-white hover:border-white before:border before:border-custom-blue before:content-[''] before:h-8 before:w-[calc(100%_+_8px)] before:absolute before:rounded-full"
              }`}
            >
              {size.name}
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
            {sizeChart.entryLabels.find((label) => label.name === selectedSize)
              ?.index !== undefined &&
              sizeChart.sizes[
                sizeChart.entryLabels.find(
                  (label) => label.name === selectedSize
                )!.index - 1
              ].measurements && (
                <ul className="leading-3 max-w-[calc(100%-20px)] flex flex-row flex-wrap gap-2">
                  {sizeChart.columns
                    .filter(
                      (column) =>
                        // Exclude "Size" column and specified measurements
                        column.name !== "Size" &&
                        !["US", "EU", "UK", "NZ", "AU", "DE"].includes(
                          column.name
                        )
                    )
                    .sort((a, b) => a.index - b.index)
                    .map((column) => (
                      <li key={column.name} className="text-nowrap">
                        <span className="text-xs text-gray">{`${column.name}: `}</span>
                        <span className="text-xs font-semibold">
                          {`${
                            sizeChart.sizes[
                              sizeChart.entryLabels.find(
                                (label) => label.name === selectedSize
                              )!.index - 1
                            ].measurements[column.name]?.in
                          }in`}
                        </span>
                      </li>
                    ))}
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

const SCROLL_THRESHOLD = 1040;

export default function ProductOptions({
  cartInfo,
  productInfo,
}: {
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
    price: string;
    images: string[];
    colors: ColorType[] | null;
    sizeChart: SizeChartType | null;
  };
}) {
  const shouldRenderOptions = () => {
    const hasColor = productInfo.colors && productInfo.colors.length > 0;
    const hasSize =
      productInfo.sizeChart && productInfo.sizeChart.entryLabels?.length > 0;
    return hasColor || hasSize;
  };

  if (!shouldRenderOptions()) {
    return null;
  }

  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [wasStickyBarVisible, setWasStickyBarVisible] = useState(false);
  const { setSelectedSize, setSelectedColor } = useOptionsStore();
  const { selectedColor, selectedSize } = useOptionsStore.getState();

  useEffect(() => {
    if (cartInfo.productInCart) {
      setSelectedColor(cartInfo.productInCart.color);
      setSelectedSize(cartInfo.productInCart.size);
    }
  }, [cartInfo.productInCart, setSelectedColor, setSelectedSize]);

  useEffect(() => {
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

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownVisible]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isStickyBarVisible = scrollY >= SCROLL_THRESHOLD;

      if (wasStickyBarVisible && !isStickyBarVisible) {
        setDropdownVisible(false);
      }

      setWasStickyBarVisible(isStickyBarVisible);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [wasStickyBarVisible]);

  return (
    <>
      <div className="dropdown-container w-max rounded-full relative">
        <button
          onClick={() => setDropdownVisible((prev) => !prev)}
          className="h-8 w-max px-4 rounded-full flex items-center justify-center gap-[2px] ease-in-out duration-300 transition bg-lightgray active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
        >
          <div className="text-sm font-medium">
            {productInfo.colors &&
            productInfo.colors.length > 0 &&
            productInfo.sizeChart &&
            productInfo.sizeChart.entryLabels?.length > 0 ? (
              !selectedColor && !selectedSize ? (
                "Select Color & Size"
              ) : selectedColor && !selectedSize ? (
                <div>
                  <span className="text-gray">Color: </span>
                  <span className="text-gray">{selectedColor} - </span>
                  <span className="text-xs font-semibold">Select Size</span>
                </div>
              ) : !selectedColor && selectedSize ? (
                <div>
                  <span className="text-gray">Size: </span>
                  <span className="text-gray">{selectedSize} - </span>
                  <span className="text-xs font-semibold">Select Color</span>
                </div>
              ) : (
                <div>
                  <span className="text-gray">Color: </span>
                  <span>{selectedColor}</span>
                  <span>, </span>
                  <span className="text-gray">Size: </span>
                  <span>{selectedSize}</span>
                </div>
              )
            ) : productInfo.colors && productInfo.colors.length > 0 ? (
              selectedColor ? (
                <div>
                  <span className="text-gray">Color: </span>
                  <span>{selectedColor}</span>
                </div>
              ) : (
                "Select Color"
              )
            ) : productInfo.sizeChart &&
              productInfo.sizeChart.entryLabels?.length > 0 ? (
              selectedSize ? (
                <div>
                  <span className="text-gray">Size: </span>
                  <span>{selectedSize}</span>
                </div>
              ) : (
                "Select Size"
              )
            ) : (
              ""
            )}
          </div>
          <ChevronRightIcon className="-mr-[8px] stroke-[#828282]" size={20} />
        </button>
        {isDropdownVisible && (
          <div className="w-max min-w-[238px] max-w-[334px] absolute top-[42px] left-0 p-5 rounded-xl shadow-dropdown bg-white before:content-[''] before:w-[14px] before:h-[14px] before:bg-white before:rounded-tl-[2px] before:rotate-45 before:origin-top-left before:absolute before:-top-[10px] before:border-l before:border-t before:border-[#d9d9d9] before:left-16 min-[840px]:before:right-24">
            <>
              {productInfo.colors &&
                productInfo.colors?.length > 0 &&
                productInfo.sizeChart &&
                productInfo.sizeChart.entryLabels?.length > 0 && (
                  <div className="flex flex-col gap-4 select-none">
                    <ProductColors colors={productInfo.colors} />
                    <ProductSizeChart sizeChart={productInfo.sizeChart} />
                  </div>
                )}
              {productInfo.colors &&
                productInfo.colors?.length > 0 &&
                !productInfo.sizeChart && (
                  <ProductColors colors={productInfo.colors} />
                )}
              {productInfo.colors?.length === 0 &&
                productInfo.sizeChart &&
                productInfo.sizeChart.entryLabels?.length > 0 && (
                  <ProductSizeChart sizeChart={productInfo.sizeChart} />
                )}
            </>
          </div>
        )}
      </div>
    </>
  );
}
