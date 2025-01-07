"use client";

import React, { useRef, useEffect } from "react";
import { useScrollStore } from "@/zustand/website/scrollStore";

export function ProductInfoWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setProductInfoWrapperHeight = useScrollStore(
    (state) => state.setProductInfoWrapperHeight
  );

  const updateHeight = () => {
    if (wrapperRef.current) {
      const height = wrapperRef.current.offsetHeight;
      setProductInfoWrapperHeight(height);
    }
  };

  useEffect(() => {
    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="sticky top-5 pt-5 w-[328px] min-w-[328px] min-[896px]:w-[340px]"
    >
      {children}
    </div>
  );
}
