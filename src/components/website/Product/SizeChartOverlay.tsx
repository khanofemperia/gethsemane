"use client";

import { CloseIcon } from "@/icons";
import { useOverlayStore } from "@/zustand/website/overlayStore";
import { productInternationalSizes } from "@/lib/utils";
import { useEffect } from "react";
import Overlay from "@/ui/Overlay";

type OptionsOverlayType = {
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

type SizeChartTableProps = {
  sizeChart: SizeChartType;
  unit: "inches" | "centimeters";
};

function SizeChartTable({ sizeChart, unit }: SizeChartTableProps) {
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

export default function OptionsOverlay({
  productInfo,
}: {
  productInfo: OptionsOverlayType;
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
        <Overlay>
          <div className="size-chart-container w-full h-[calc(100%-60px)] rounded-t-2xl absolute bottom-0 overflow-hidden bg-white">
            <div className="flex items-center justify-center pt-5 pb-2">
              <h2 className="font-semibold">Product measurements</h2>
              <button
                onClick={() => {
                  hideOverlay({
                    pageName,
                    overlayName: overlayName,
                  });
                }}
                className="h-7 w-7 rounded-full absolute right-5 flex items-center justify-center transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                type="button"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="w-full h-[calc(100%-52px)] px-5 pt-2 pb-[240px] invisible-scrollbar overflow-x-hidden overflow-y-visible">
              <div className="w-full max-w-[620px] mx-auto flex flex-col gap-6 mt-6">
                <div>
                  <h3 className="font-semibold mb-4">Inches</h3>
                  <SizeChartTable
                    sizeChart={productInfo.options.sizes}
                    unit="inches"
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Centimeters</h3>
                  <SizeChartTable
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
        </Overlay>
      )}
    </>
  );
}
