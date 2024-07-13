"use client";

import { CloseIcon } from "@/icons";
import { useOverlayStore } from "@/zustand/website/overlayStore";
import { productInternationalSizes } from "@/lib/utils";
import { useEffect } from "react";
import Overlay from "@/ui/Overlay";

type ColorType = {
  name: string;
  image: string;
};

type SizeChartTableType = {
  sizeChart: SizeChartType;
  unit: "in" | "cm";
};

function SizeChartTable({ sizeChart, unit }: SizeChartTableType) {
  return (
    <div className="border w-full max-w-[max-content] rounded overflow-y-hidden overflow-x-visible custom-x-scrollbar">
      <table className="w-max bg-white">
        <thead className="h-10 border-b">
          <tr>
            {sizeChart.columns.map((column, index) => (
              <th
                key={index}
                className={`px-5 text-nowrap text-sm ${
                  index === sizeChart.columns.length - 1 ? "" : "border-r"
                } ${index === 0 ? "sticky left-0 bg-neutral-100" : ""}`}
              >
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sizeChart.sizes.map((entry, entryIndex) => (
            <tr
              key={entryIndex}
              className={`h-10 ${
                entryIndex === sizeChart.sizes.length - 1 ? "" : "border-b"
              }`}
            >
              <td className="text-sm text-center border-r w-[100px] sticky left-0 bg-neutral-100">
                {entry.size}
              </td>
              {sizeChart.columns.slice(1).map((column, columnIndex) => (
                <td
                  key={columnIndex}
                  className={`text-center w-[100px] ${
                    columnIndex === sizeChart.columns.length - 2
                      ? ""
                      : "border-r"
                  }`}
                >
                  {unit === "in"
                    ? entry.measurements[
                        column.name as keyof typeof entry.measurements
                      ]?.in
                    : entry.measurements[
                        column.name as keyof typeof entry.measurements
                      ]?.cm}
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
  productInfo: {
    id: string;
    name: string;
    price: string;
    images: string[];
    colors: ColorType[] | null;
    sizeChart: SizeChartType | null;
  };
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
      {isOverlayVisible && productInfo.sizeChart && (
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
                  <SizeChartTable sizeChart={productInfo.sizeChart} unit="in" />
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Centimeters</h3>
                  <SizeChartTable sizeChart={productInfo.sizeChart} unit="cm" />
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
