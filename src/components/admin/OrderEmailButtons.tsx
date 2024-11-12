"use client";

import { ChevronRightIcon } from "@/icons";
import { OrderConfirmedEmailPreviewButton } from "./OrderConfirmedEmailPreviewOverlay";
import { OrderShippedEmailPreviewButton } from "./OrderShippedEmailPreviewOverlay";
import { OrderDeliveredEmailPreviewButton } from "./OrderDeliveredEmailPreviewOverlay";

export function OrderEmailButtons() {
  return (
    <div className="flex flex-wrap gap-5">
      <OrderConfirmedEmailPreviewButton />
      <OrderShippedEmailPreviewButton />
      <OrderDeliveredEmailPreviewButton />
    </div>
  );
}
