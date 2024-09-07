"use client";

import { useTransition } from "react";
import { TrashIcon } from "@/icons";
import { RemoveFromCartAction } from "@/actions/shopping-cart";
import { AlertMessageType } from "@/lib/sharedTypes";
import { useAlertStore } from "@/zustand/website/alertStore";

export function RemoveFromCartButton({ variantId }: { variantId: string }) {
  const [isPending, startTransition] = useTransition();

  const { showAlert } = useAlertStore();

  const handleRemove = () => {
    startTransition(async () => {
      const result = await RemoveFromCartAction({ variantId });
      showAlert({
        message: result.message,
        type:
          result.type === AlertMessageType.ERROR
            ? AlertMessageType.ERROR
            : AlertMessageType.NEUTRAL,
      });
    });
  };

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="min-w-8 max-w-8 min-h-8 max-h-8 rounded-full flex items-center justify-center ease-in-out duration-300 transition hover:bg-lightgray"
    >
      <TrashIcon size={18} className="fill-gray" />
    </button>
  );
}
