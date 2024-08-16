"use client";

import { CloseIconThin } from "@/icons";
import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";
import { useEffect } from "react";

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
    }[];
  };
};

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
        <div className="relative overflow-hidden shadow rounded-2xl bg-white">
          <div className="w-[640px] h-full pt-8 pb-[85px] flex flex-col relative">
            <div className="mb-2">
              <div className="w-max mx-auto flex gap-y-1 gap-x-2 *:w-7 *:h-7 *:rounded-full *:bg-lightgray *:flex *:items-center *:justify-center *:text-xs">
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
              </div>
            </div>
            <div className="custom-scrollbar overflow-x-hidden overflow-y-visible"></div>
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
