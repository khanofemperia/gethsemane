"use client";

import { formatThousands } from "@/lib/utils";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";

type UpsellProductType = {
  id: string;
  name: string;
  slug: string;
  mainImage: string;
  basePrice: number;
};

type UpsellType = {
  id: string;
  mainImage: string;
  pricing: PricingType;
  visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
  createdAt: string;
  updatedAt: string;
  products: UpsellProductType[];
};

type DataType = {
  pricing: PricingType;
  upsell: UpsellType;
  mainImage: string;
  name: string;
};

const SCROLL_THRESHOLD = 1040;

export default function StickyBar({
  productInfo,
  Options,
}: {
  productInfo: DataType;
  Options: React.ReactNode;
}) {
  const [barIsHidden, setBarIsHidden] = useState(true);

  const { pricing, upsell, mainImage, name } = productInfo;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= SCROLL_THRESHOLD) {
        setBarIsHidden(false);
      } else {
        setBarIsHidden(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={clsx(
        "hidden md:block w-full py-4 px-5 fixed top-0 border-b -translate-y-full bg-white",
        {
          "-translate-y-full": barIsHidden,
          "translate-y-0 ease-in-out duration-150 transition": !barIsHidden,
        }
      )}
    >
      <div className="w-full max-w-[1080px] h-16 mx-auto flex gap-5 items-center justify-between">
        <div className="h-full flex gap-5">
          <div className="h-full aspect-square relative rounded-md flex items-center justify-center overflow-hidden">
            <Image
              src={mainImage}
              alt={name}
              width={64}
              height={64}
              priority={true}
            />
            <div className="w-full h-full rounded-md absolute top-0 bottom-0 left-0 right-0 ease-in-out hover:bg-blue hover:bg-opacity-40 hover:duration-300 hover:ease-out"></div>
          </div>
          <div className="h-full flex gap-5 items-center">
            <div className="w-max flex items-center justify-center">
              {Number(pricing.salePrice) ? (
                <div className="flex items-center gap-[6px]">
                  <span className="font-bold">
                    ${formatThousands(Number(pricing.salePrice))}
                  </span>
                  <span className="text-xs text-gray line-through mt-[2px]">
                    ${formatThousands(Number(pricing.basePrice))}
                  </span>
                  <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-[10px] px-[5px] flex items-center justify-center">
                    -{pricing.discountPercentage}%
                  </span>
                </div>
              ) : (
                <p className="font-bold">
                  ${formatThousands(Number(pricing.basePrice))}
                </p>
              )}
            </div>
            {Options}
          </div>
        </div>
        <div className="w-[348px] min-[840px]:w-[410px] flex gap-3">
          <button className="font-semibold w-full h-[44px] min-[840px]:h-12 text-sm min-[840px]:text-base rounded-full ease-in-out duration-150 transition border border-[rgb(150,150,150)] hover:border-[rgb(80,80,80)] active:border-[rgb(150,150,150)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.16)]">
            Add to Cart
          </button>
          <div className="w-full h-[44px] min-[840px]:h-12 relative rounded-full">
            <button className="peer inline-block text-center align-middle h-[44px] min-[840px]:h-12 w-full text-sm min-[840px]:text-base border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-300 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]">
              Yes, Let's Upgrade
            </button>
            {!barIsHidden && (
              <div className="peer-hover:block hidden absolute top-[58px] -right-3 py-[18px] px-6 rounded-xl shadow-dropdown bg-white before:content-[''] before:w-[14px] before:h-[14px] before:bg-white before:rounded-tl-[2px] before:rotate-45 before:origin-top-left before:absolute before:-top-[10px] before:border-l before:border-t before:border-[#d9d9d9] before:right-20 min-[840px]:before:right-24">
                {upsell && upsell.products.length > 0 && (
                  <div className="w-max rounded-md pb-[10px] bg-white">
                    <div className="w-full">
                      <div>
                        <h2 className="font-black text-center text-[21px] text-red leading-6 [letter-spacing:-1px] [word-spacing:2px] [text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)] w-[248px] mx-auto">
                          UPGRADE MY ORDER
                        </h2>
                        <div className="mt-1 text-center font-medium text-amber-dimmed">
                          {upsell.pricing.salePrice
                            ? `$${formatThousands(
                                Number(upsell.pricing.salePrice)
                              )} (${upsell.pricing.discountPercentage}% Off)`
                            : `$${formatThousands(
                                Number(upsell.pricing.basePrice)
                              )} today`}
                        </div>
                      </div>
                      <div className="mt-3 h-[210px] aspect-square mx-auto overflow-hidden">
                        <Image
                          src={upsell.mainImage}
                          alt="Upgrade order"
                          width={240}
                          height={240}
                          priority
                        />
                      </div>
                      <div className="w-[184px] mx-auto mt-5 text-xs leading-6 [word-spacing:1px]">
                        <ul className="*:flex *:justify-between">
                          {upsell.products.map((product) => (
                            <li key={product.id}>
                              <p className="text-gray">{product.name}</p>
                              <p>
                                <span
                                  className={`${
                                    upsell.pricing.salePrice > 0 &&
                                    upsell.pricing.salePrice <
                                      upsell.pricing.basePrice
                                      ? "line-through text-gray"
                                      : "text-gray"
                                  }`}
                                >
                                  ${formatThousands(Number(product.basePrice))}
                                </span>
                              </p>
                            </li>
                          ))}
                          {upsell.pricing.salePrice > 0 &&
                            upsell.pricing.salePrice <
                              upsell.pricing.basePrice && (
                              <li className="mt-2 flex items-center rounded font-semibold">
                                <p className="mx-auto">
                                  You Save $
                                  {formatThousands(
                                    Number(upsell.pricing.basePrice) -
                                      Number(upsell.pricing.salePrice)
                                  )}
                                </p>
                              </li>
                            )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
