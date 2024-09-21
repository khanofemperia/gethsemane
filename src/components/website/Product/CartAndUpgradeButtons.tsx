"use client";

import { useAlertStore } from "@/zustand/website/alertStore";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import { useState, useTransition, useEffect } from "react";
import { AlertMessageType } from "@/lib/sharedTypes";
import { AddToCartAction } from "@/actions/shopping-cart";
import { Spinner } from "@/ui/Spinners/Default";
import clsx from "clsx";

type CartAndUpgradeButtonsType = {
  productId: string;
  cart: CartType | null;
  hasColor: boolean;
  hasSize: boolean;
};

export function CartAndUpgradeButtons({
  productId,
  cart,
  hasColor,
  hasSize,
}: CartAndUpgradeButtonsType) {
  const [isPending, startTransition] = useTransition();
  const [isInCart, setIsInCart] = useState<boolean>(false);

  const { selectedColor, selectedSize } = useOptionsStore();
  const { showAlert } = useAlertStore();

  useEffect(() => {
    setIsInCart(
      cart?.items.some((item) => {
        if (item.type === "product") {
          return (
            item.baseProductId === productId &&
            item.color === selectedColor &&
            item.size === selectedSize
          );
        }
        return false;
      }) ?? false
    );
  }, [cart, productId, selectedColor, selectedSize]);

  const handleAddToCart = async () => {
    if (hasColor && !selectedColor) {
      return showAlert({
        message: "Select a color",
        type: AlertMessageType.NEUTRAL,
      });
    }
    if (hasSize && !selectedSize) {
      return showAlert({
        message: "Select a size",
        type: AlertMessageType.NEUTRAL,
      });
    }

    startTransition(async () => {
      const result = await AddToCartAction({
        type: "product",
        baseProductId: productId,
        color: selectedColor,
        size: selectedSize,
      });

      showAlert({
        message: result.message,
        type:
          result.type === AlertMessageType.ERROR
            ? AlertMessageType.ERROR
            : AlertMessageType.NEUTRAL,
      });

      if (result.type === AlertMessageType.SUCCESS) {
        setIsInCart(true);
      }
    });
  };

  return (
    <>
      {!isInCart && (
        <button
          onClick={handleAddToCart}
          disabled={isPending}
          className={clsx(
            "flex items-center justify-center w-full rounded-full cursor-pointer border border-[#c5c3c0] text-sm font-semibold h-[44px] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] min-[896px]:text-base min-[896px]:h-12",
            { "cursor-context-menu opacity-50": isPending }
          )}
        >
          {isPending ? <Spinner size={28} color="gray" /> : "Add to cart"}
        </button>
      )}
      <button className="flex items-center justify-center w-full rounded-full cursor-pointer border border-[#b27100] text-white text-sm font-semibold h-[44px] shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000] hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] min-[896px]:text-base min-[896px]:h-12">
        Yes, let's upgrade
      </button>
    </>
  );
}
