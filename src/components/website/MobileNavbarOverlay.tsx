"use client";

import { CloseIconThin } from "@/icons";
import { useMobileNavbarStore } from "@/zustand/website/mobileNavbarStore";
import Image from "next/image";
import Link from "next/link";
import { HiMiniBars3 } from "react-icons/hi2";
import { useRef, useEffect } from "react";
import clsx from "clsx";

export function MobileNavbarButton() {
  const showMobileNavbarOverlay = useMobileNavbarStore(
    (state) => state.showMobileNavbarOverlay
  );

  return (
    <button
      onClick={showMobileNavbarOverlay}
      className="h-12 w-12 rounded-full flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray lg:hover:bg-lightgray"
      aria-label="Menu"
    >
      <HiMiniBars3 size={26} />
    </button>
  );
}

export function MobileNavbarOverlay() {
  const hideMobileNavbarOverlay = useMobileNavbarStore(
    (state) => state.hideMobileNavbarOverlay
  );
  const isMobileNavbarOverlayVisible = useMobileNavbarStore(
    (state) => state.isMobileNavbarOverlayVisible
  );

  const overlayRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Media query for md breakpoint (typically 768px)
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    // Handler to close overlay when screen size increases
    const handleMediaQueryChange = (
      e: MediaQueryListEvent | MediaQueryList
    ) => {
      if (e.matches && isMobileNavbarOverlayVisible) {
        hideMobileNavbarOverlay();
      }
    };

    // Check initial state
    handleMediaQueryChange(mediaQuery);

    // Add listener for changes
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, [isMobileNavbarOverlayVisible, hideMobileNavbarOverlay]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        overlayRef.current &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        overlayRef.current.contains(event.target as Node)
      ) {
        hideMobileNavbarOverlay();
      }
    };

    if (isMobileNavbarOverlayVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMobileNavbarOverlayVisible, hideMobileNavbarOverlay]);

  return (
    <>
      <div
        ref={overlayRef}
        className={clsx(
          isMobileNavbarOverlayVisible
            ? "md:hidden fixed top-0 bottom-0 left-0 right-0 z-40 transition duration-300 ease-in-out bg-glass-black backdrop-blur-sm md:overflow-x-hidden md:overflow-y-visible md:custom-scrollbar"
            : "hidden"
        )}
      >
        <div
          ref={menuRef}
          className="absolute right-0 bottom-0 top-0 h-full w-3/4 max-w-80 px-5 pt-3 bg-white"
        >
          <div className="h-full">
            <Link
              href="/"
              className="h-12 min-w-[168px] w-[168px] ml-[2px] flex items-center justify-center"
            >
              <Image
                src="/images/logos/cherlygood_wordmark.svg"
                alt="Cherly Good"
                width={160}
                height={40}
                priority
              />
            </Link>
            <div className="mt-5 flex flex-col gap-1 *:h-10 *:ml-2 *:w-max *:text-lg *:font-medium *:rounded-full *:flex *:items-center">
              <Link href="/new-arrivals">New Arrivals</Link>
              <Link href="/category/dresses">Dresses</Link>
              <Link href="/category/tops">Tops</Link>
              <Link href="/category/bottoms">Bottoms</Link>
              <Link href="/category/outerwear">Outerwear</Link>
              <Link href="/category/shoes">Shoes</Link>
              <Link href="/category/accessories">Accessories</Link>
              <Link href="/category/men">Men</Link>
              <Link href="/category/catch-all">Catch-All</Link>
            </div>
          </div>
          <button
            onClick={hideMobileNavbarOverlay}
            className="h-9 w-9 rounded-full absolute right-3 top-2 flex items-center justify-center transition duration-300 ease-in-out hover:bg-lightgray"
            type="button"
          >
            <CloseIconThin size={24} className="stroke-gray" />
          </button>
        </div>
      </div>
    </>
  );
}
