"use client";

import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";
import { useEffect } from "react";

export function ResetUpsellReview() {
  const { isVisible, hideOverlay } = useUpsellReviewStore();

  useEffect(() => {
    if (isVisible) {
      hideOverlay();
    }
  }, [isVisible, hideOverlay]);

  return null;
}
