"use client";

import { useAlertStore } from "@/zustand/website/alertStore";
import { useOptionsStore } from "@/zustand/website/optionsStore";

export function CartAndUpgradeButtons({
  hasColor,
  hasSize,
}: {
  hasColor: boolean;
  hasSize: boolean;
}) {
  const { selectedColor, selectedSize } = useOptionsStore();
  const { showAlert } = useAlertStore();

  const handleAddToCart = async () => {
    if (hasColor && !selectedColor) {
      return showAlert("Select a color");
    }
    if (hasSize && !selectedSize) {
      return showAlert("Select a size");
    }

    console.log("Adding to cart...");
    // Add the product to the cart
  };

  //   const handleUpgrade = () => {
  //     // show upsellReviewOverlay.tsx
  //   };

  return (
    <>
      <button
        onClick={handleAddToCart}
        className="text-sm min-[896px]:text-base font-semibold w-full h-[44px] min-[896px]:h-12  rounded-full ease-in-out duration-150 transition border border-[rgb(150,150,150)] hover:border-[rgb(80,80,80)] active:border-[rgb(150,150,150)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.16)]"
      >
        Add to Cart
      </button>
      <button className="text-sm min-[896px]:text-base inline-block text-center align-middle h-[44px] min-[896px]:h-12 w-full border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-100 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]">
        Yes, Let's Upgrade
      </button>
    </>
  );
}
