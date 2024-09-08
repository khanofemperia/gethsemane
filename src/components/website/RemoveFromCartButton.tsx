"use client";

import { useTransition } from "react";
import { TrashIcon } from "@/icons";
import { RemoveFromCartAction } from "@/actions/shopping-cart";
import { AlertMessageType } from "@/lib/sharedTypes";
import { useAlertStore } from "@/zustand/website/alertStore";
import { DashSpinner } from "@/ui/Spinners/DashSpinner";
import clsx from "clsx";

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
      className={clsx(
        "min-w-8 max-w-8 min-h-8 max-h-8 rounded-full flex items-center justify-center",
        { "ease-in-out duration-300 transition hover:bg-lightgray": !isPending }
      )}
    >
      {isPending ? (
        <DashSpinner size={18} color="#6c6c6c" />
      ) : (
        <TrashIcon size={18} className="fill-gray" />
      )}
    </button>
  );
}
