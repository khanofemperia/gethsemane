"use client";

import React, { useRef, useEffect, useState } from "react";
import { useScrollStore } from "@/zustand/website/scrollStore";

export function ProductInfoWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const setShouldShowBar = useScrollStore((state) => state.setShouldShowBar);
  const scrollPosition = useScrollStore((state) => state.scrollPosition);

  useEffect(() => {
    const updateHeight = () => {
      if (wrapperRef.current) {
        const height = wrapperRef.current.offsetHeight;
        setWrapperHeight(height);
      }
    };

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

  useEffect(() => {
    const offset = 82;
    const threshold = wrapperHeight + offset;
    setShouldShowBar(scrollPosition >= threshold);
  }, [scrollPosition, wrapperHeight, setShouldShowBar]);

  return (
    <div
      ref={wrapperRef}
      className="sticky top-5 pt-5 w-[328px] min-w-[328px] min-[896px]:w-[340px]"
    >
      {children}
    </div>
  );
}
