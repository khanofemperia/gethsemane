"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useQuickviewStore } from "@/zustand/website/quickviewStore";
import { CheckmarkIcon, CloseIcon } from "@/icons";
import Images from "../Product/Images";
import { formatThousands } from "@/lib/utils";
import Options from "@/components/website/Product/Options";
import styles from "./styles.module.css";
import { UpsellReviewButton } from "../UpsellReviewOverlay";

type ProductWithUpsellType = Omit<ProductType, "upsell"> & {
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      salePrice: number;
      basePrice: number;
      discountPercentage: number;
    };
    visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
    createdAt: string;
    updatedAt: string;
    products: {
      id: string;
      name: string;
      slug: string;
      mainImage: string;
      basePrice: number;
    }[];
  };
};

export function QuickviewButton({
  product,
  onClick,
}: {
  product: ProductWithUpsellType;
  onClick?: (event: React.MouseEvent) => void;
}) {
  const { showOverlay } = useQuickviewStore();
  const setSelectedProduct = useQuickviewStore(
    (state) => state.setSelectedProduct
  );

  const handleClick = (event: React.MouseEvent) => {
    if (onClick) {
      event.stopPropagation();
      onClick(event);
    }

    const isInCart = false;
    const productInCart = null;

    setSelectedProduct(product, isInCart, productInCart);
    showOverlay();
  };

  return (
    <button
      onClick={handleClick}
      className="outline-none border-none rounded-full w-[44px] h-7 flex items-center justify-center relative before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-0 before:right-0 before:border before:border-black before:rounded-full before:transition before:duration-100 before:ease-in-out active:before:scale-105 lg:hover:before:scale-105"
    >
      <Image
        src="/images/other/cart_plus.svg"
        alt="Add to cart"
        width={20}
        height={20}
        priority={true}
      />
    </button>
  );
}

export function QuickviewOverlay() {
  const { hideOverlay } = useQuickviewStore();

  const { isOverlayOpened } = useQuickviewStore((state) => ({
    isOverlayOpened: state.isVisible,
  }));

  const { isInCart, productInCart, selectedProduct } = useQuickviewStore(
    (state) => ({
      selectedProduct: state.selectedProduct,
      isInCart: state.isInCart,
      productInCart: state.productInCart,
    })
  );

  useEffect(() => {
    if (isOverlayOpened) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isOverlayOpened]);

  const isVisible = isOverlayOpened && selectedProduct;

  return (
    isVisible && (
      <div className="custom-scrollbar flex justify-center py-20 w-screen h-screen overflow-x-hidden overflow-y-visible z-20 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
        <div className="w-max max-h-[554px] py-8 absolute top-16 bottom-16 bg-white mx-auto shadow rounded-2xl">
          <div className="pl-8 pr-10 flex flex-row gap-8 custom-scrollbar max-h-[554px] h-full overflow-x-hidden overflow-y-visible">
            <div className="w-[556px] flex flex-col gap-16">
              <Images
                images={selectedProduct.images}
                productName={selectedProduct.name}
              />
            </div>
            <div className="w-[400px]">
              <div>
                <div className="flex flex-col gap-5 pt-4">
                  <p className="line-clamp-2 text-sm text-gray">
                    {selectedProduct.name}
                  </p>
                  <div className="flex flex-col gap-4">
                    <div
                      className="text-lg leading-[26px] [&>:last-child]:mb-0"
                      dangerouslySetInnerHTML={{
                        __html: selectedProduct.highlights.headline || "",
                      }}
                    />
                    <ul className="text-sm list-inside *:leading-[22px]">
                      {selectedProduct.highlights.keyPoints
                        .slice()
                        .sort((a, b) => a.index - b.index)
                        .map((point) => (
                          <li
                            key={point.index}
                            className="flex items-start gap-2 mb-[7px] last:mb-0"
                          >
                            <CheckmarkIcon
                              className="fill-green mt-[1px] -ml-[1px]"
                              size={19}
                            />
                            <span>{point.text}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="w-max flex items-center justify-center">
                      {Number(selectedProduct.pricing.salePrice) ? (
                        <div className="flex items-center gap-[6px]">
                          <span className="font-bold">
                            $
                            {formatThousands(
                              Number(selectedProduct.pricing.salePrice)
                            )}
                          </span>
                          <span className="text-xs text-gray line-through mt-[2px]">
                            $
                            {formatThousands(
                              Number(selectedProduct.pricing.basePrice)
                            )}
                          </span>
                          <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-[10px] px-[5px] flex items-center justify-center">
                            -{selectedProduct.pricing.discountPercentage}%
                          </span>
                        </div>
                      ) : (
                        <p className="font-bold">
                          $
                          {formatThousands(
                            Number(selectedProduct.pricing.basePrice)
                          )}
                        </p>
                      )}
                    </div>
                    <Options
                      cartInfo={{
                        isInCart,
                        productInCart,
                      }}
                      productInfo={{
                        id: selectedProduct.id,
                        name: selectedProduct.name,
                        pricing: selectedProduct.pricing,
                        images: selectedProduct.images,
                        options: selectedProduct.options,
                      }}
                    />
                  </div>
                </div>
                {selectedProduct.upsell &&
                  selectedProduct.upsell.products.length > 0 && (
                    <div
                      className={`${styles.customBorder} mt-7 pt-5 pb-[26px] px-6 w-max rounded-md select-none bg-white`}
                    >
                      <div className="w-full">
                        <div>
                          <h2 className="font-black text-center text-[21px] text-red leading-6 [letter-spacing:-1px] [word-spacing:2px] [text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)] w-[248px] mx-auto">
                            UPGRADE MY ORDER
                          </h2>
                          <div className="mt-1 text-center font-medium text-amber-dimmed">
                            {selectedProduct.upsell.pricing.salePrice
                              ? `$${formatThousands(
                                  Number(
                                    selectedProduct.upsell.pricing.salePrice
                                  )
                                )} (${
                                  selectedProduct.upsell.pricing
                                    .discountPercentage
                                }% Off)`
                              : `$${formatThousands(
                                  Number(
                                    selectedProduct.upsell.pricing.basePrice
                                  )
                                )} today`}
                          </div>
                        </div>
                        <div className="mt-3 h-[210px] aspect-square mx-auto overflow-hidden">
                          <Image
                            src={selectedProduct.upsell.mainImage}
                            alt="Upgrade order"
                            width={240}
                            height={240}
                            priority
                          />
                        </div>
                        <div className="w-[184px] mx-auto mt-5 text-xs leading-6 [word-spacing:1px]">
                          <ul className="*:flex *:justify-between">
                            {selectedProduct.upsell.products.map((product) => (
                              <li key={product.id}>
                                <p className="text-gray">{product.name}</p>
                                <p>
                                  <span
                                    className={`${
                                      selectedProduct.upsell.pricing.salePrice >
                                        0 &&
                                      selectedProduct.upsell.pricing.salePrice <
                                        selectedProduct.upsell.pricing.basePrice
                                        ? "line-through text-gray"
                                        : "text-gray"
                                    }`}
                                  >
                                    $
                                    {formatThousands(Number(product.basePrice))}
                                  </span>
                                </p>
                              </li>
                            ))}
                            {selectedProduct.upsell.pricing.salePrice > 0 &&
                              selectedProduct.upsell.pricing.salePrice <
                                selectedProduct.upsell.pricing.basePrice && (
                                <li className="mt-2 flex items-center rounded font-semibold">
                                  <p className="mx-auto">
                                    You Save $
                                    {formatThousands(
                                      Number(
                                        selectedProduct.upsell.pricing.basePrice
                                      ) -
                                        Number(
                                          selectedProduct.upsell.pricing
                                            .salePrice
                                        )
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
              <div className="sticky left-0 right-0 bottom-0 z-10 mt-6 pt-1 pb-5 shadow-[0_-12px_16px_2px_white] bg-white">
                <div className="flex gap-2 min-[896px]:gap-3">
                  <button className="text-sm min-[896px]:text-base font-semibold w-full h-[44px] min-[896px]:h-12  rounded-full ease-in-out duration-150 transition border border-[rgb(150,150,150)] hover:border-[rgb(80,80,80)] active:border-[rgb(150,150,150)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.16)]">
                    Add to Cart
                  </button>
                  <UpsellReviewButton product={{id: selectedProduct.id, upsell: selectedProduct.upsell}} />
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={hideOverlay}
            className="h-9 w-9 rounded-full absolute right-3 top-2 flex items-center justify-center transition duration-300 ease-in-out hover:bg-lightgray"
            type="button"
          >
            <CloseIcon size={24} />
          </button>
        </div>
      </div>
    )
  );
}
