"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CartIcon, SearchIcon } from "@/icons";

export default function Navbar() {
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [prevScrollPosition, setPrevScrollPosition] = useState(0);
  const [isNavbarHidden, setIsNavbarHidden] = useState(true);
  const searchRef = useRef(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        const currentScrollPosition = window.scrollY;
        const scrollDifference = currentScrollPosition - prevScrollPosition;

        if (scrollDifference > 0) {
          setIsScrollingUp(false);
        } else if (scrollDifference < 0) {
          setIsScrollingUp(true);
        }

        setPrevScrollPosition(currentScrollPosition);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [prevScrollPosition]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!searchRef.current || !(event.target instanceof Node)) {
        return;
      }

      const targetNode = searchRef.current as Node;

      if (!targetNode.contains(event.target)) {
        setIsSearchVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isSearchVisible) {
      setIsNavbarHidden(true);
      setIsScrollingUp(true);
    }

    if (isSearchVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchVisible]);

  return (
    <>
      <nav
        className={clsx(
          "w-full max-h-[116px] md:max-h-16 z-20 fixed top-0 border-b transition duration-100 ease-in-out bg-white",
          {
            "-translate-y-full":
              !isScrollingUp && isNavbarHidden && prevScrollPosition >= 154,
          }
        )}
      >
        <div className="w-full max-w-[1080px] mx-auto px-6 py-2 relative flex gap-1 flex-col md:flex-row">
          <Link
            href="/"
            className="h-12 min-w-[168px] w-[168px] pl-2 flex items-center"
          >
            <Image
              src="/images/logos/cherlygood_wordmark.svg"
              alt="Cherly Good"
              width={160}
              height={40}
              priority
            />
          </Link>
          <div className="w-full flex items-center justify-center md:pl-6 lg:pl-0 overflow-hidden">
            <Link
              href="/shop"
              className="flex items-center gap-[10px] px-5 w-full md:max-w-[560px] h-12 rounded-full ease-in-out transition duration-300 bg-[#e9eff6] active:bg-[#c4f8d6] lg:hover:bg-[#c4f8d6]"
            >
              <Image
                src="/images/other/waving_hand.webp"
                alt="Cherly Good"
                width={28}
                height={28}
                priority
              />
              <span className="min-[480px]:hidden md:block min-[820px]:hidden font-medium text-gray">
                Browse the store
              </span>
              <span className="hidden min-[480px]:block md:hidden min-[820px]:block font-medium text-gray">
                Click here to browse the store
              </span>
            </Link>
          </div>
          <div className="absolute right-4 top-2 md:relative md:right-auto md:top-auto min-w-[160px] w-[160px] h-12 flex items-center justify-end *:h-12 *:w-12 *:rounded-full *:flex *:items-center *:justify-center *:ease-in-out *:transition *:duration-300">
            <Link
              href="/cart"
              className="active:bg-lightgray lg:hover:bg-lightgray"
            >
              <CartIcon size={26} />
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
