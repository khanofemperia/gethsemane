"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { CartIcon } from "@/icons";
import { HiMiniChevronDown } from "react-icons/hi2";

export default function Navbar({ itemsInCart }: { itemsInCart: number }) {
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [prevScrollPosition, setPrevScrollPosition] = useState(0);

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

  return (
    <>
      <nav
        className={clsx(
          "w-full max-h-[116px] md:max-h-16 z-20 fixed top-0 border-b transition duration-100 ease-in-out bg-white",
          {
            "-translate-y-full": !isScrollingUp && prevScrollPosition >= 154,
          }
        )}
      >
        <div className="w-full max-w-[1080px] mx-auto px-6 py-2 relative flex justify-between gap-1 flex-col md:flex-row">
          <div className="flex items-center gap-5">
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
            <div className="flex gap-3 h-12 *:text-sm *:font-semibold *:px-2 *:rounded-full *:flex *:items-center *:transition *:duration-300 *:ease-in-out">
              <Link href="/new-arrivals" className="hover:bg-lightgray">
                New Arrivals
              </Link>
              <button className="hover:bg-lightgray flex items-center">
                <span>Categories</span>
                <HiMiniChevronDown size={18} className="-mr-1" />
              </button>
              <Link href="#" className="hover:bg-lightgray">
                Track Order
              </Link>
            </div>
          </div>
          <div className="absolute right-4 top-2 md:relative md:right-auto md:top-auto min-w-[160px] w-[160px] h-12 flex items-center justify-end">
            <Link
              href="/cart"
              className="relative h-12 w-12 rounded-full flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray lg:hover:bg-lightgray"
            >
              <CartIcon size={26} />
              {itemsInCart > 0 && (
                <span className="absolute top-[4px] left-[30px] min-w-5 w-max h-5 px-1 rounded-full text-sm font-medium flex items-center justify-center text-white bg-red">
                  {itemsInCart}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
