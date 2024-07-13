"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  const isShop = pathname.startsWith("/admin/shop");
  const isStorefront = pathname === "/admin/shop";
  const isProducts = pathname === "/admin/shop/products";
  const isUpsells = pathname === "/admin/shop/upsells";

  return (
    <div className="hidden h-full lg:flex lg:gap-4 *:h-full *:flex *:items-center *:px-1 *:relative *:before:content-[''] *:before:w-full *:before:h-[1px] *:before:absolute *:before:bottom-[-1px] *:before:left-0 *:before:right-0">
      {isShop && (
        <>
          <Link
            href="/admin/shop"
            className={`${
              isStorefront
                ? "before:bg-black font-medium"
                : "before:bg-transparent text-gray"
            }`}
          >
            Storefront
          </Link>
          <Link
            href="/admin/shop/products"
            className={`${
              isProducts
                ? "before:bg-black font-medium"
                : "before:bg-transparent text-gray"
            }`}
          >
            Products
          </Link>
          <Link
            href="/admin/shop/upsells"
            className={`${
              isUpsells
                ? "before:bg-black font-medium"
                : "before:bg-transparent text-gray"
            }`}
          >
            Upsells
          </Link>
        </>
      )}
    </div>
  );
}
