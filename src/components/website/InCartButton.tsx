"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";

export function InCartButton({ isInCart }: { isInCart: boolean }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/cart")}
      className={clsx(
        "px-8 flex items-center justify-center w-full rounded-full cursor-pointer border border-[#c5c3c0] text-blue font-semibold h-[44px] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] min-[896px]:h-12",
        !isInCart && "hidden"
      )}
    >
      In Cart - See Now
    </button>
  );
}
