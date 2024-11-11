"use client";

import { ChevronRightIcon } from "@/icons";
import { OrderConfirmedEmailPreviewButton, OrderConfirmedEmailPreviewOverlay } from "./EmailPreviewOverlay";

export function OrderEmails() {
  return (
    <>
      <div className="flex flex-wrap gap-5">
        <OrderConfirmedEmailPreviewButton />
        <button className="w-[310px] py-3 px-4 border cursor-pointer rounded-lg flex justify-center gap-2 ease-in-out duration-300 transition hover:bg-lightgray">
          <div>
            <h2 className="font-semibold text-sm mb-1 flex items-center gap-[2px] w-max mx-auto">
              <span>Shipped</span>
              <ChevronRightIcon size={16} className="text-gray" />
            </h2>
            <div>
              <span className="text-xs text-gray">Not sent yet</span>{" "}
              <span className="text-xs text-gray">• 2 attempts remaining</span>
            </div>
          </div>
        </button>
        <button className="w-[310px] py-3 px-4 border cursor-pointer rounded-lg flex justify-center gap-2 ease-in-out duration-300 transition hover:bg-lightgray">
          <div>
            <h2 className="font-semibold text-sm mb-1 flex items-center gap-[2px] w-max mx-auto">
              <span>Delivered</span>
              <ChevronRightIcon size={16} className="text-gray" />
            </h2>
            <p className="text-xs text-gray"></p>
            <div>
              <span className="text-xs text-red">Max attempts used</span>{" "}
              <span className="text-xs text-gray">• Last sent Nov 5, 2024</span>
            </div>
          </div>
        </button>
      </div>
      <OrderConfirmedEmailPreviewOverlay />
    </>
  );
}
