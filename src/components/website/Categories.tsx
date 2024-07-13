"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { capitalizeFirstLetter } from "@/lib/utils";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const INITIAL_CATEGORY_WIDTH = 110;
const DESKTOP_CATEGORY_WIDTH = 120;
const GAP_BETWEEN_CATEGORIES = 20;
const PADDING_AND_GAP_ADJUSTMENT = 12;
const DESKTOP_CAROUSEL_MAX_WIDTH = 828;
const MOBILE_CAROUSEL_MAX_WIDTH = 768;
const DESKTOP_SCREEN_WIDTH = 1024;

export function Categories({
  categories,
}: {
  categories: CategoryType[];
}) {
  const [distance, setDistance] = useState(0);
  const [isPrevButtonHidden, setIsPrevButtonHidden] = useState(true);
  const [isNextButtonHidden, setIsNextButtonHidden] = useState(true);
  const [categoryWidth, setCategoryWidth] = useState(INITIAL_CATEGORY_WIDTH);
  const [shouldTransition, setShouldTransition] = useState(true);

  const carouselRef = useRef(null);

  const resetCarousel = (screenWidth: number) => {
    setShouldTransition(false);
    setDistance(0);
    setIsPrevButtonHidden(true);

    const totalCategoriesWidth =
      categories.length * (categoryWidth + GAP_BETWEEN_CATEGORIES) -
      PADDING_AND_GAP_ADJUSTMENT;

    if (screenWidth >= MOBILE_CAROUSEL_MAX_WIDTH) {
      setIsNextButtonHidden(totalCategoriesWidth <= MOBILE_CAROUSEL_MAX_WIDTH);
    } else {
      setIsNextButtonHidden(totalCategoriesWidth <= screenWidth);
    }

    if (screenWidth >= DESKTOP_SCREEN_WIDTH) {
      setCategoryWidth(DESKTOP_CATEGORY_WIDTH);
    } else {
      setCategoryWidth(INITIAL_CATEGORY_WIDTH);
    }
  };

  useEffect(() => {
    const handleResize = () => resetCarousel(window.innerWidth);
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [categories]);

  useEffect(() => {
    const totalCategoriesWidth =
      categories.length * (categoryWidth + GAP_BETWEEN_CATEGORIES) -
      PADDING_AND_GAP_ADJUSTMENT;

    const screenWidth = window.innerWidth;

    if (screenWidth >= MOBILE_CAROUSEL_MAX_WIDTH) {
      if (screenWidth >= DESKTOP_SCREEN_WIDTH) {
        setIsNextButtonHidden(
          distance <= -(totalCategoriesWidth - DESKTOP_CAROUSEL_MAX_WIDTH)
        );
      } else {
        setIsNextButtonHidden(
          distance <= -(totalCategoriesWidth - MOBILE_CAROUSEL_MAX_WIDTH)
        );
      }
    } else {
      setIsNextButtonHidden(distance <= -(totalCategoriesWidth - screenWidth));
    }

    setIsPrevButtonHidden(distance === 0);
  }, [distance, categories.length, categoryWidth]);

  useEffect(() => {
    resetCarousel(window.innerWidth);
  }, []);

  const handleNext = () => {
    setShouldTransition(true);
    setDistance(distance - (categoryWidth + GAP_BETWEEN_CATEGORIES));
  };

  const handlePrev = () => {
    setShouldTransition(true);
    setDistance(distance + (categoryWidth + GAP_BETWEEN_CATEGORIES));
  };

  return (
    <div className="relative mb-5 w-full max-w-[768px] lg:max-w-[828px] mx-auto flex justify-center">
      <div className="overflow-hidden" ref={carouselRef}>
        <div
          style={{ transform: `translateX(${distance}px)` }}
          className={clsx("w-max flex gap-5 p-1", {
            "ease-in-out duration-300 transition": shouldTransition,
          })}
        >
          {categories.map(({ index, name, image }) => (
            <Link
              key={index}
              href={`/shop/categories/${name.toLowerCase()}`}
              className="flex flex-col gap-2 items-center rounded-xl p-[10px] ease-in-out duration-300 transition hover:shadow-[0px_0px_4px_rgba(0,0,0,0.35)]"
            >
              <div className="lg:hidden w-[90px] h-[90px] rounded-full shadow-[rgba(0,0,0,0.2)_0px_1px_3px_0px,_rgba(27,31,35,0.15)_0px_0px_0px_1px]">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center z-10">
                  <Image
                    src={`/images/categories/${image}`}
                    alt={name}
                    width={90}
                    height={90}
                    priority={true}
                  />
                </div>
              </div>
              <div className="hidden lg:block w-[100px] h-[100px] rounded-full shadow-[rgba(0,0,0,0.2)_0px_1px_3px_0px,_rgba(27,31,35,0.15)_0px_0px_0px_1px]">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center z-10">
                  <Image
                    src={`/images/categories/${image}`}
                    alt={name}
                    width={100}
                    height={100}
                    priority={true}
                  />
                </div>
              </div>
              <div className="text-xs font-medium">
                {capitalizeFirstLetter(name)}
              </div>
            </Link>
          ))}
        </div>
      </div>
      {!isPrevButtonHidden && (
        <button
          onClick={handlePrev}
          className="w-9 h-9 rounded-full absolute left-4 lg:-left-3 top-[44px] bg-neutral-800 bg-opacity-75 flex items-center justify-center transition duration-300 ease-in-out active:bg-opacity-100 lg:hover:bg-opacity-100"
        >
          <ChevronLeftIcon className="stroke-white mr-[2px]" size={22} />
        </button>
      )}
      {!isNextButtonHidden && (
        <button
          onClick={handleNext}
          className="w-9 h-9 rounded-full absolute right-4 lg:-right-3 top-[44px] bg-neutral-800 bg-opacity-75 flex items-center justify-center transition duration-300 ease-in-out active:bg-opacity-100 lg:hover:bg-opacity-100"
        >
          <ChevronRightIcon className="stroke-white ml-[2px]" size={22} />
        </button>
      )}
    </div>
  );
}
