"use client";

import { HamburgerMenuIcon } from "@/icons";
import clsx from "clsx";
import Link from "next/link";
import { useEffect } from "react";
import { NewProductMenuButton } from "../NewProduct";
import { useNavbarMenuStore } from "@/zustand/admin/navbarMenuStore";
import { usePathname } from "next/navigation";
import { NewCollectionMenuButton } from "../Storefront/NewCollection";
import { NewUpsellMenuButton } from "../NewUpsell";

export default function Menu() {
  const { navbarMenuVisible, setNavbarMenu } = useNavbarMenuStore();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (navbarMenuVisible && !target.closest(".menu")) {
        setNavbarMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [navbarMenuVisible, setNavbarMenu]);

  const isProductsPage = pathname === "/admin/shop/products";
  const isProductEditingPage =
    /^\/admin\/shop\/products\/[a-z0-9-]+-\d{5}$/.test(pathname);
  const isUpsellsPage = pathname === "/admin/shop/upsells";
  const isCollectionsPage = pathname === "/admin/shop";

  const showSeparator =
    isProductsPage || isCollectionsPage || isProductEditingPage;
  const productSlug = isProductEditingPage
    ? pathname.split("/").pop()
    : undefined;

  return (
    <div className="menu relative h-10 rounded-full">
      <button
        onClick={() => setNavbarMenu(!navbarMenuVisible)}
        className="w-10 h-10 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray-dimmed"
      >
        <HamburgerMenuIcon size={24} />
      </button>
      <div
        className={clsx("w-44 absolute top-[44px] -right-1 z-10", {
          hidden: !navbarMenuVisible,
          block: navbarMenuVisible,
        })}
      >
        <div className="overflow-hidden h-full w-full py-[5px] flex flex-col gap-0 rounded-xl shadow-thick-bottom bg-white">
          {isProductsPage && <NewProductMenuButton />}
          {isUpsellsPage && <NewUpsellMenuButton />}
          {isProductEditingPage && (
            <Link
              href={`/shop/${productSlug}`}
              className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray"
            >
              Visit product
            </Link>
          )}
          {isCollectionsPage && <NewCollectionMenuButton />}
          {showSeparator && (
            <div className="h-[1px] my-[5px] bg-[#e5e7eb]"></div>
          )}
          <div className="lg:hidden">
            <Link
              href="/admin/shop"
              className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray"
            >
              Storefront
            </Link>
            <Link
              href="/admin/shop/products"
              className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray"
            >
              Products
            </Link>
            <Link
              href="/admin/shop/upsells"
              className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray"
            >
              Upsells
            </Link>
            <div className="h-[1px] my-[5px] bg-[#e5e7eb]"></div>
          </div>
          <Link
            href="/"
            className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray"
          >
            Public website
          </Link>
          <Link
            href="#"
            className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray"
          >
            Sign out
          </Link>
        </div>
      </div>
    </div>
  );
}
