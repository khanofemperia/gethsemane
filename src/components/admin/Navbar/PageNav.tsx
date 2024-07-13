"use client";

import { ChevronDownIcon } from "@/icons";
import clsx from "clsx";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function PageNav() {
  const [isPagesNavOpen, setIsPagesNavOpen] = useState(false);
  const pagesMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!pagesMenuRef.current || !(event.target instanceof Node)) {
        return;
      }

      const targetNode = pagesMenuRef.current as Node;

      if (!targetNode.contains(event.target)) {
        setIsPagesNavOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const togglePagesNav = () => {
    setIsPagesNavOpen((prevState) => !prevState);
  };

  return (
    <div ref={pagesMenuRef} className="relative h-9 rounded-full">
      <button
        onClick={togglePagesNav}
        className="h-9 px-3 rounded-full flex items-center justify-center bg-blue-100 border border-[#bad8fe] active:border-[#92c1fd]"
      >
        <span className="font-medium text-custom-blue">Shop</span>
        <ChevronDownIcon className="stroke-custom-blue -mr-[4px]" size={20} />
      </button>
      <div
        className={clsx("w-44 absolute top-[44px] -left-1 z-10", {
          hidden: !isPagesNavOpen,
          block: isPagesNavOpen,
        })}
      >
        <div className="overflow-hidden h-full w-full py-[5px] flex flex-col gap-0 rounded-xl shadow-thick-bottom bg-white">
          <Link
            href="/admin"
            className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray"
          >
            Overview
          </Link>
          <Link
            href="/admin/shop"
            className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray"
          >
            Shop
          </Link>
          <Link
            href="/admin/blog"
            className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray"
          >
            Blog
          </Link>
          <Link
            href="/admin/newsletter"
            className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray"
          >
            Newsletter
          </Link>
        </div>
      </div>
    </div>
  );
}
