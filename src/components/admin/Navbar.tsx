"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { HamburgerMenuIcon } from "@/icons";
import { NewProductMenuButton } from "./NewProduct";
import { NewUpsellMenuButton } from "./NewUpsell";
import { NewCollectionMenuButton } from "./Storefront/NewCollection";
import { DeleteProductAction } from "@/actions/products";
import { DeleteUpsellAction } from "@/actions/upsells";
import { DeleteCollectionAction } from "@/actions/collections";
import { MobileNavbarButton } from "./MobileNavbarOverlay";

export default function Navbar() {
  return (
    <nav className="w-full max-h-[116px] md:max-h-16 fixed top-0 z-10 shadow-[0px_1px_2px_#DDDDDD] bg-lightgray">
      {/* <DesktopNavbar /> */}
      <MobileNavbar />
    </nav>
  );
}

function DesktopNavbar() {
  const [isMenuDropdownVisible, setMenuDropdownVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isProductListPage = pathname === "/admin/products";
  const isProductEditingPage = /^\/admin\/products\/[a-z0-9-]+-\d{5}$/.test(
    pathname
  );
  const isCollectionListPage = pathname === "/admin/storefront";
  const isCollectionEditingPage =
    /^\/admin\/collections\/[a-z0-9-]+-\d{5}$/.test(pathname);
  const isUpsellListPage = pathname === "/admin/upsells";
  const isUpsellEditingPage = /^\/admin\/upsells\/\d{5}$/.test(pathname);

  const showSeparator =
    isProductListPage ||
    isCollectionListPage ||
    isProductEditingPage ||
    isUpsellEditingPage ||
    isCollectionEditingPage ||
    isUpsellListPage;

  const productSlug = isProductEditingPage
    ? pathname.split("/").pop()
    : undefined;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuDropdownVisible(false);
      }
    };

    const handleScroll = () => {
      if (isMenuDropdownVisible) {
        setMenuDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isMenuDropdownVisible]);

  const getIdFromPath = () => {
    if (isProductEditingPage) {
      const match = pathname.match(/-(\d{5})$/);
      return match ? match[1] : null;
    }
    if (isUpsellEditingPage) {
      const match = pathname.match(/\/(\d{5})$/);
      return match ? match[1] : null;
    }
    if (isCollectionEditingPage) {
      const match = pathname.match(/-(\d{5})$/);
      return match ? match[1] : null;
    }
    return null;
  };

  const toggleMenuDropdown = () => {
    setMenuDropdownVisible(!isMenuDropdownVisible);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleDelete = async () => {
    const id = getIdFromPath();
    if (!id) return;

    setIsDeleting(true);
    try {
      let redirectPath = "";

      if (isProductEditingPage) {
        await DeleteProductAction({ id });
        redirectPath = "/admin/products";
      } else if (isUpsellEditingPage) {
        await DeleteUpsellAction({ id });
        redirectPath = "/admin/upsells";
      } else if (isCollectionEditingPage) {
        await DeleteCollectionAction({ id });
        redirectPath = "/admin/storefront";
      }

      router.push(redirectPath);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
      setMenuDropdownVisible(false);
    }
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto px-6 py-2 relative flex justify-between gap-1 flex-col md:flex-row">
      <div className="flex items-center gap-5">
        <Link
          href="/admin"
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
        <div className="flex gap-3 h-9 *:text-sm *:font-semibold *:h-full *:px-2 *:rounded-full *:flex *:items-center *:justify-center *:transition *:duration-300 *:ease-in-out">
          <Link href="/admin/storefront" className="hover:bg-lightgray-dimmed">
            Storefront
          </Link>
          <Link href="/admin/products" className="hover:bg-lightgray-dimmed">
            Products
          </Link>
          <Link href="/admin/upsells" className="hover:bg-lightgray-dimmed">
            Upsells
          </Link>
          <Link href="/admin/orders" className="hover:bg-lightgray-dimmed">
            Orders
          </Link>
        </div>
      </div>
      <div className="absolute right-4 top-2 md:relative md:right-auto md:top-auto min-w-[160px] w-[160px] h-12 flex items-center justify-end">
        <div className="relative" ref={menuRef}>
          <button
            onClick={toggleMenuDropdown}
            className="h-11 w-11 rounded-full flex items-center justify-center transition duration-300 ease-in-out hover:bg-lightgray-dimmed"
          >
            <HamburgerMenuIcon size={24} />
          </button>

          {isMenuDropdownVisible && (
            <div className="w-[148px] absolute top-[52px] right-0 z-20 py-[5px] rounded-md shadow-dropdown bg-white">
              {isProductListPage && (
                <NewProductMenuButton
                  closeMenu={() => setMenuDropdownVisible(false)}
                />
              )}
              {isUpsellListPage && (
                <NewUpsellMenuButton
                  closeMenu={() => setMenuDropdownVisible(false)}
                />
              )}
              {isCollectionListPage && (
                <NewCollectionMenuButton
                  closeMenu={() => setMenuDropdownVisible(false)}
                />
              )}
              {isProductEditingPage && (
                <>
                  <button
                    onClick={() => {
                      handleNavigation(`/${productSlug}`);
                      setMenuDropdownVisible(false);
                    }}
                    className="h-9 w-[calc(100%-10px)] mx-auto px-3 text-sm font-semibold rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray hover:bg-lightgray"
                  >
                    Visit product
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-9 w-[calc(100%-10px)] mx-auto px-3 text-red text-sm font-semibold rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray hover:bg-lightgray disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
              {(isUpsellEditingPage || isCollectionEditingPage) && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-9 w-[calc(100%-10px)] mx-auto px-3 text-red text-sm font-semibold rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray hover:bg-lightgray disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              )}

              {/* Common Menu Items */}
              {showSeparator && (
                <div className="h-[1px] my-[5px] bg-[#e5e7eb]"></div>
              )}
              <button
                onClick={() => {
                  handleNavigation("/");
                  setMenuDropdownVisible(false);
                }}
                className="h-9 w-[calc(100%-10px)] mx-auto px-3 text-sm text-yellow-700 font-semibold rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
              >
                Public website
              </button>
              <button
                onClick={() => {
                  handleNavigation("#");
                  setMenuDropdownVisible(false);
                }}
                className="h-9 w-[calc(100%-10px)] mx-auto px-3 text-sm font-semibold rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileNavbar() {
  return (
    <div className="md:hidden flex items-center justify-between w-full max-w-[1080px] mx-auto pl-4 pr-[10px] py-2">
      <Link
        href="/admin"
        className="h-12 min-w-[168px] w-[168px] flex items-center justify-center"
      >
        <Image
          src="/images/logos/cherlygood_wordmark.svg"
          alt="Cherly Good"
          width={160}
          height={40}
          priority
        />
      </Link>
      <MobileNavbarButton />
    </div>
  );
}
