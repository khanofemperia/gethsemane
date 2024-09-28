"use client";

import { CloseIcon, CloseIconThin } from "@/icons";
import { useOverlayStore } from "@/zustand/website/overlayStore";
import { productInternationalSizes } from "@/lib/utils";
import { useEffect } from "react";
import Overlay from "@/ui/Overlay";

type SizeChartOverlayType = {
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

function Chart({
  sizeChart,
  unit,
}: {
  sizeChart: SizeChartType;
  unit: "inches" | "centimeters";
}) {
  const chartData = sizeChart[unit === "inches" ? "inches" : "centimeters"];

  return (
    <div className="border w-full max-w-[max-content] rounded overflow-y-hidden overflow-x-visible custom-x-scrollbar">
      <table className="w-max bg-white">
        <thead className="h-10 border-b">
          <tr>
            {chartData.columns.map((column, index) => (
              <th
                key={index}
                className={`px-5 text-nowrap text-sm ${
                  index === chartData.columns.length - 1 ? "" : "border-r"
                } ${index === 0 ? "sticky left-0 bg-neutral-100" : ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chartData.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`h-10 ${
                rowIndex === chartData.rows.length - 1 ? "" : "border-b"
              }`}
            >
              {chartData.columns.map((column, columnIndex) => (
                <td
                  key={columnIndex}
                  className={`text-center w-[100px] ${
                    columnIndex === 0
                      ? "sticky left-0 bg-neutral-100"
                      : columnIndex === chartData.columns.length - 1
                      ? ""
                      : "border-r"
                  }`}
                >
                  {row[column.label]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SizeChartOverlay({
  productInfo,
}: {
  productInfo: SizeChartOverlayType;
}) {
  const { hideOverlay } = useOverlayStore();

  const { pageName, overlayName, isOverlayVisible } = useOverlayStore(
    (state) => ({
      pageName: state.pages.productDetails.name,
      overlayName: state.pages.productDetails.overlays.sizeChart.name,
      isOverlayVisible: state.pages.productDetails.overlays.sizeChart.isVisible,
    })
  );

  useEffect(() => {
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isOverlayVisible]);

  return (
    <>
      {isOverlayVisible && productInfo.options.sizes && (
        <div className="overlay fixed top-0 bottom-0 left-0 right-0 z-50 transition duration-300 ease-in-out bg-glass-black backdrop-blur-sm md:overflow-x-hidden md:overflow-y-visible md:custom-scrollbar">
          <div className="size-chart-container absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white md:w-max md:min-w-[516px] md:max-w-[740px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <h2 className="font-semibold text-center pt-5 pb-2">
              Product measurements
            </h2>
            <button
              onClick={() => {
                hideOverlay({
                  pageName,
                  overlayName: overlayName,
                });
              }}
              className="h-9 w-9 rounded-full absolute right-3 top-2 flex items-center justify-center transition duration-300 ease-in-out hover:bg-lightgray"
              type="button"
            >
              <CloseIconThin size={24} className="stroke-gray" />
            </button>
            <div className="w-full h-[calc(100%-52px)] px-5 pb-10 invisible-scrollbar overflow-x-hidden overflow-y-visible">
              <div className="w-full max-w-[602px] mx-auto flex flex-col gap-6 mt-6">
                <div>
                  <h3 className="font-semibold mb-4">Inches</h3>
                  <Chart sizeChart={productInfo.options.sizes} unit="inches" />
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Centimeters</h3>
                  <Chart
                    sizeChart={productInfo.options.sizes}
                    unit="centimeters"
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-4">
                    International size conversions
                  </h3>
                  <div className="border w-full max-w-[max-content] rounded overflow-y-hidden overflow-x-visible custom-x-scrollbar">
                    <table className="w-max bg-white">
                      <thead className="h-10 border-b">
                        <tr>
                          {Object.keys(productInternationalSizes).map(
                            (sizeType, index) => (
                              <th
                                key={index}
                                className={`px-5 text-nowrap text-sm ${
                                  index ===
                                  Object.keys(productInternationalSizes)
                                    .length -
                                    1
                                    ? ""
                                    : "border-r"
                                } ${
                                  index === 0
                                    ? "sticky left-0 bg-neutral-100"
                                    : ""
                                }`}
                              >
                                {sizeType}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {productInternationalSizes.Size.map((_, sizeIndex) => (
                          <tr
                            key={sizeIndex}
                            className={`h-10 ${
                              sizeIndex !==
                              productInternationalSizes.Size.length - 1
                                ? "border-b"
                                : ""
                            }`}
                          >
                            {Object.keys(productInternationalSizes).map(
                              (sizeType, index) => (
                                <td
                                  key={index}
                                  className={`text-center px-5 w-[100px] ${
                                    index === 0
                                      ? "sticky left-0 bg-neutral-100 border-r text-sm"
                                      : index ===
                                        Object.keys(productInternationalSizes)
                                          .length -
                                          1
                                      ? ""
                                      : "border-r"
                                  }`}
                                >
                                  {
                                    (
                                      productInternationalSizes as Record<
                                        string,
                                        string[]
                                      >
                                    )[sizeType][sizeIndex]
                                  }
                                </td>
                              )
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
