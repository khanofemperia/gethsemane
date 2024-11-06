"use client";

import React, { useEffect, useState } from "react";
import { RemoveFromCartButton } from "@/components/website/RemoveFromCartButton";
import { CheckmarkIcon } from "@/icons";
import { formatThousands } from "@/lib/utils";
import { PiShieldCheckBold } from "react-icons/pi";
import { TbLock, TbTruck } from "react-icons/tb";
import { PayPalButton } from "@/components/website/PayPalButton";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

type CartItemType =
  | {
      type: "product";
      baseProductId: string;
      name: string;
      slug: string;
      pricing: any;
      mainImage: string;
      variantId: string;
      size: string;
      color: string;
      index: number;
    }
  | {
      type: "upsell";
      baseUpsellId: string;
      variantId: string;
      index: number;
      mainImage: string;
      pricing: any;
      products: Array<{
        index: number;
        id: string;
        slug: string;
        name: string;
        mainImage: string;
        basePrice: number;
        size: string;
        color: string;
      }>;
    };

export default function CartItemList({
  cartItems,
}: {
  cartItems: CartItemType[];
}) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(cartItems.map((item) => item.variantId))
  );

  // Keep track of manually deselected items
  const [deselectedItems, setDeselectedItems] = useState<Set<string>>(
    new Set()
  );

  // Keep track of manually selected items
  const [manuallySelectedItems, setManuallySelectedItems] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    // Update selections when cart items change
    setSelectedItems((prevSelected) => {
      const newSelected = new Set<string>();

      cartItems.forEach((item) => {
        const variantId = item.variantId;

        // Keep item selected if:
        // 1. It was manually selected previously
        // 2. OR it's a new item AND wasn't manually deselected before
        if (
          manuallySelectedItems.has(variantId) ||
          (!prevSelected.has(variantId) && !deselectedItems.has(variantId))
        ) {
          newSelected.add(variantId);
        }
        // Keep item selected if it was previously selected and not manually deselected
        else if (
          prevSelected.has(variantId) &&
          !deselectedItems.has(variantId)
        ) {
          newSelected.add(variantId);
        }
      });

      return newSelected;
    });
  }, [cartItems, deselectedItems, manuallySelectedItems]);

  const toggleItem = (variantId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(variantId)) {
        newSet.delete(variantId);
        // Track manually deselected items
        setDeselectedItems(new Set([...deselectedItems, variantId]));
        setManuallySelectedItems(
          new Set([...manuallySelectedItems].filter((id) => id !== variantId))
        );
      } else {
        newSet.add(variantId);
        // Track manually selected items
        setManuallySelectedItems(
          new Set([...manuallySelectedItems, variantId])
        );
        setDeselectedItems(
          new Set([...deselectedItems].filter((id) => id !== variantId))
        );
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
      // Add all current items to deselected set
      setDeselectedItems(new Set(cartItems.map((item) => item.variantId)));
      setManuallySelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.variantId)));
      // Clear deselected items when selecting all
      setDeselectedItems(new Set());
      setManuallySelectedItems(
        new Set(cartItems.map((item) => item.variantId))
      );
    }
  };

  const formatProductOptions = (color?: string, size?: string) => {
    if (!color && !size) return null;
    if (color && size) return `${color} / ${size}`;
    return color || size;
  };

  const calculateTotal = () => {
    const totalBasePrice = cartItems.reduce((total, item) => {
      if (!selectedItems.has(item.variantId)) return total;

      const itemPrice = item.pricing.salePrice || item.pricing.basePrice;
      const price =
        typeof itemPrice === "number" ? itemPrice : parseFloat(itemPrice);
      return isNaN(price) ? total : total + price;
    }, 0);

    return Number(totalBasePrice.toFixed(2));
  };

  const getSelectedCartItems = () => {
    return cartItems.filter((item) => selectedItems.has(item.variantId));
  };

  return (
    <div className="relative flex flex-row gap-16 pt-8">
      <div className="min-w-[560px] max-w-[560px] h-max">
        <div className="flex flex-col gap-5">
          <div className="flex gap-5">
            <div className="flex items-center">
              <div
                onClick={toggleAll}
                className={clsx(
                  "w-5 h-5 cursor-pointer rounded-full flex items-center justify-center ease-in-out duration-200 transition",
                  selectedItems.size === cartItems.length
                    ? "bg-black"
                    : "border border-neutral-400"
                )}
              >
                {selectedItems.size > 0 && (
                  <CheckmarkIcon className="fill-white" size={16} />
                )}
              </div>
            </div>
            <span className="font-semibold">
              {selectedItems.size > 0
                ? `Checkout (${selectedItems.size} ${
                    selectedItems.size === 1 ? "Item" : "Items"
                  })`
                : "Select items for checkout"}
            </span>
          </div>
          <div className="flex flex-col gap-5">
            {cartItems.map((item) => {
              const isSelected = selectedItems.has(item.variantId);

              if (item.type === "product") {
                const productOptions = formatProductOptions(
                  item.color,
                  item.size
                );
                return (
                  <div key={item.index} className="flex gap-5">
                    <div className="flex items-center">
                      <div
                        onClick={() => toggleItem(item.variantId)}
                        className={clsx(
                          "w-5 h-5 cursor-pointer rounded-full flex items-center justify-center ease-in-out duration-200 transition",
                          isSelected ? "bg-black" : "border border-neutral-400"
                        )}
                      >
                        {isSelected && (
                          <CheckmarkIcon className="fill-white" size={16} />
                        )}
                      </div>
                    </div>
                    <div className="min-w-[146px] max-w-[146px] min-h-[146px] max-h-[146px] overflow-hidden rounded-lg flex items-center justify-center">
                      <Image
                        src={item.mainImage}
                        alt={item.name}
                        width={146}
                        height={146}
                        priority
                      />
                    </div>
                    <div className="w-full pr-3 flex flex-col gap-1">
                      <div className="min-w-full h-5 flex items-center justify-between gap-5">
                        <Link
                          href={`${item.slug}-${item.baseProductId}`}
                          target="_blank"
                          className="text-gray text-xs line-clamp-1 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <RemoveFromCartButton
                          type="product"
                          variantId={item.variantId}
                        />
                      </div>
                      {productOptions && (
                        <span className="mb-1 text-xs font-medium">
                          {productOptions}
                        </span>
                      )}
                      <div className="w-max flex items-center justify-center">
                        {Number(item.pricing.salePrice) ? (
                          <div className="flex items-center gap-[6px]">
                            <div className="flex items-baseline text-[rgb(168,100,0)]">
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                $
                              </span>
                              <span className="text-lg font-bold">
                                {Math.floor(Number(item.pricing.salePrice))}
                              </span>
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                {(Number(item.pricing.salePrice) % 1)
                                  .toFixed(2)
                                  .substring(1)}
                              </span>
                            </div>
                            <span className="text-[0.813rem] leading-3 text-gray line-through">
                              ${formatThousands(Number(item.pricing.basePrice))}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline">
                            <span className="text-[0.813rem] leading-3 font-semibold">
                              $
                            </span>
                            <span className="text-lg font-bold">
                              {Math.floor(Number(item.pricing.basePrice))}
                            </span>
                            <span className="text-[0.813rem] leading-3 font-semibold">
                              {(Number(item.pricing.basePrice) % 1)
                                .toFixed(2)
                                .substring(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              } else if (item.type === "upsell") {
                return (
                  <div key={item.index} className="flex gap-5">
                    <div className="flex items-center">
                      <div
                        onClick={() => toggleItem(item.variantId)}
                        className={clsx(
                          "w-5 h-5 cursor-pointer rounded-full flex items-center justify-center ease-in-out duration-200 transition",
                          isSelected ? "bg-black" : "border border-neutral-400"
                        )}
                      >
                        {isSelected && (
                          <CheckmarkIcon className="fill-white" size={16} />
                        )}
                      </div>
                    </div>
                    <div className="relative w-full p-5 rounded-lg bg-[#fffbf6] border border-[#fceddf]">
                      <div className="mb-5 min-w-full h-5 flex gap-5 items-center justify-between">
                        <div className="w-max flex items-center justify-center">
                          {Number(item.pricing.salePrice) ? (
                            <div className="flex items-center gap-[6px]">
                              <div className="flex items-baseline text-[rgb(168,100,0)]">
                                <span className="text-[0.813rem] leading-3 font-semibold">
                                  $
                                </span>
                                <span className="text-xl font-bold">
                                  {Math.floor(Number(item.pricing.salePrice))}
                                </span>
                                <span className="text-[0.813rem] leading-3 font-semibold">
                                  {(Number(item.pricing.salePrice) % 1)
                                    .toFixed(2)
                                    .substring(1)}
                                </span>
                              </div>
                              <span className="text-[0.813rem] leading-3 text-gray line-through">
                                $
                                {formatThousands(
                                  Number(item.pricing.basePrice)
                                )}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-baseline text-[rgb(168,100,0)]">
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                $
                              </span>
                              <span className="text-lg font-bold">
                                {Math.floor(Number(item.pricing.basePrice))}
                              </span>
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                {(Number(item.pricing.basePrice) % 1)
                                  .toFixed(2)
                                  .substring(1)}
                              </span>
                              <span className="ml-1 text-[0.813rem] leading-3 font-semibold">
                                today
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-5">
                        {item.products.map((product) => {
                          const productOptions = formatProductOptions(
                            product.color,
                            product.size
                          );

                          return (
                            <div
                              key={product.id}
                              className="last:mb-0 w-[146px]"
                            >
                              <div className="mb-2 w-full h-[146px] rounded-md overflow-hidden border border-[#fceddf] bg-white flex items-center justify-center">
                                <Image
                                  src={product.mainImage}
                                  alt={product.name}
                                  width={146}
                                  height={146}
                                  priority
                                />
                              </div>
                              <div className="flex flex-col gap-[2px]">
                                <Link
                                  href={`${product.slug}-${product.id}`}
                                  target="_blank"
                                  className="text-gray text-xs hover:underline w-max"
                                >
                                  {product.name.length > 18
                                    ? `${product.name.slice(0, 18)}...`
                                    : product.name}
                                </Link>
                                {productOptions && (
                                  <span className="text-xs font-medium">
                                    {productOptions}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <RemoveFromCartButton
                        type="upsell"
                        variantId={item.variantId}
                      />
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
      <div className="select-none min-w-[340px] max-w-[340px] sticky top-16 h-max flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-[6px] items-center">
            <TbLock className="stroke-green -ml-[1px]" size={20} />
            <span className="text-sm text-gray">
              Secure Checkout with SSL Encryption
            </span>
          </div>
          <div className="flex gap-[6px] items-center">
            <PiShieldCheckBold className="fill-green" size={18} />
            <span className="text-sm text-gray ml-[1px]">
              Safe and Trusted Payment Methods
            </span>
          </div>
          <div className="flex gap-[6px] items-center">
            <TbTruck className="stroke-green" size={20} />
            <span className="text-sm text-gray">Free Shipping for You</span>
          </div>
        </div>
        <div className="mb-2 flex items-center gap-1">
          {selectedItems.size > 0 ? (
            <>
              <span className="font-medium">
                Total ({selectedItems.size}{" "}
                {selectedItems.size === 1 ? "Item" : "Items"}):
              </span>
              <div className="flex items-baseline">
                <span className="text-sm font-semibold">$</span>
                <span className="text-xl font-bold">
                  {Math.floor(Number(calculateTotal()))}
                </span>
                <span className="text-sm font-semibold">
                  {(Number(calculateTotal()) % 1).toFixed(2).substring(1)}
                </span>
              </div>
            </>
          ) : (
            <button
              onClick={toggleAll}
              className="text-sm text-blue px-3 w-max h-8 rounded-full cursor-pointer flex items-center justify-center border border-[#d9d8d6] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.1)]"
            >
              Select all items
            </button>
          )}
        </div>
        <div
          className={clsx(
            selectedItems.size ? "flex items-center mb-2" : "hidden"
          )}
        >
          <div className="h-[20px] rounded-[3px] flex items-center justify-center">
            <Image
              src="/images/payment-methods/visa.svg"
              alt="Visa"
              width={34}
              height={34}
              priority={true}
              draggable={false}
            />
          </div>
          <div className="ml-[10px] h-[18px] w-[36px] rounded-[3px] flex items-center justify-center">
            <Image
              className="-ml-[4px]"
              src="/images/payment-methods/mastercard.svg"
              alt="Mastercard"
              width={38}
              height={38}
              priority={true}
              draggable={false}
            />
          </div>
          <div className="ml-[5px] h-[20px] overflow-hidden rounded-[3px] flex items-center justify-center">
            <Image
              src="/images/payment-methods/american-express.png"
              alt="American Express"
              width={60}
              height={20}
              priority={true}
              draggable={false}
            />
          </div>
          <div className="ml-[10px] h-[20px] rounded-[3px] flex items-center justify-center">
            <Image
              src="/images/payment-methods/discover.svg"
              alt="Discover"
              width={64}
              height={14}
              priority={true}
              draggable={false}
            />
          </div>
          <div className="ml-[10px] h-[20px] rounded-[3px] flex items-center justify-center">
            <Image
              src="/images/payment-methods/diners-club-international.svg"
              alt="Diners Club International"
              width={68}
              height={10}
              priority={true}
              draggable={false}
            />
          </div>
        </div>
        {selectedItems.size > 0 && (
          <PayPalButton cart={getSelectedCartItems()} />
        )}
      </div>
    </div>
  );
}
