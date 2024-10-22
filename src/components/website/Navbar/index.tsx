"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import { CartIcon } from "@/icons";
import { HiMiniChevronDown } from "react-icons/hi2";

export default function Navbar({
  itemsInCart,
  categories,
}: {
  itemsInCart: number;
  categories: CategoryType[] | null;
}) {
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [prevScrollPosition, setPrevScrollPosition] = useState(0);
  const [isCategoriesDropdownVisible, setCategoriesDropdownVisible] =
    useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

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
        setCategoriesDropdownVisible(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node)
      ) {
        setCategoriesDropdownVisible(false);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        window.removeEventListener("scroll", handleScroll);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [prevScrollPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node)
      ) {
        setCategoriesDropdownVisible(false);
      }
    };

    const handleScroll = () => {
      if (isCategoriesDropdownVisible) {
        setCategoriesDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isCategoriesDropdownVisible]);

  const toggleCategoriesDropdown = () => {
    setCategoriesDropdownVisible(!isCategoriesDropdownVisible);
  };

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
            <div className="flex gap-3 h-12">
              <Link
                href="/new-arrivals"
                className="hover:bg-lightgray h-12 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out"
              >
                New Arrivals
              </Link>
              {categories && categories.length > 0 && (
                <div className="relative" ref={categoriesRef}>
                  <button
                    onClick={toggleCategoriesDropdown}
                    className="hover:bg-lightgray h-12 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out"
                  >
                    <span>Categories</span>
                    <HiMiniChevronDown
                      size={18}
                      className={`-mr-1 transition-transform duration-300 ${
                        isCategoriesDropdownVisible ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isCategoriesDropdownVisible && (
                    <div className="w-36 absolute top-[56px] left-0 z-20 py-2 rounded-md shadow-dropdown bg-white before:content-[''] before:w-[10px] before:h-[10px] before:bg-white before:rounded-tl-[2px] before:rotate-45 before:origin-top-left before:absolute before:-top-2 before:border-l before:border-t before:border-[#d9d9d9] before:left-12 min-[840px]:before:right-24">
                      {categories.map((category, index) => (
                        <Link
                          key={index}
                          href={`/category/${category.name.toLowerCase()}`}
                          className="block px-5 py-2 text-sm font-semibold transition duration-300 ease-in-out hover:bg-lightgray"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <Link
                href="#"
                className="hover:bg-lightgray h-12 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out"
              >
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
