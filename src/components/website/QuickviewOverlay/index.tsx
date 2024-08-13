"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useQuickviewStore } from "@/zustand/website/quickviewStore";
import { CheckmarkIcon, CloseIcon } from "@/icons";
import { getProductWithUpsell } from "@/lib/getData";
import Images from "../Product/Images";
import { formatThousands } from "@/lib/utils";
import Options from "@/components/website/Product/Options";
import styles from "./styles.module.css";

type ProductType = {
  index: number;
  id: string;
  name: string;
  slug: string;
  description: string;
  highlights: {
    headline: string;
    keyPoints: { index: number; text: string }[];
  };
  pricing: {
    salePrice: number;
    basePrice: number;
    discountPercentage: number;
  };
  images: {
    main: string;
    gallery: string[];
  };
  options: {
    colors: Array<{
      name: string;
      image: string;
    }>;
    sizes: {
      inches: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
      centimeters: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
    };
  };
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
  product: ProductType;
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

    // const item = {
    //   id: "91062",
    //   name: "Waterproof Windproof Women's Hiking Jacket",
    //   slug: "waterproof-windproof-womens-hiking-jacket",
    //   description:
    //     '<p class="TextEditorTheme__paragraph" dir="ltr"><b><strong class="TextEditorTheme__textBold" style="white-space: pre-wrap;">Imagine this: you’re exploring the city in the middle of a downpour, and you’re still dry and stylish.</strong></b><span style="white-space: pre-wrap;"> Wind gusts are no match, and you’re as warm as ever.</span></p><p class="TextEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">This jacket lets you take on rainy days, stroll through the park in chilly winds, and stay comfortable no matter the weather. Go ahead and live your life, no matter the weather. </span><b><strong class="TextEditorTheme__textBold" style="white-space: pre-wrap;">With this jacket, you’re ready for anything.</strong></b></p><p class="TextEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">It’s like a hug you can wear. Slip it on, and it feels just like your favorite sweater – soft, cozy, and instantly comforting.</span></p><p class="TextEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">Remember those times you had to turn down a spontaneous picnic or skip a hike because of the weather? With this jacket, you can say “yes” to all those adventures. Rain? No problem. Chilly evening? You’re covered. Literally!</span></p><p class="TextEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">We all want to look good while we’re out and about. This jacket is like that perfect pair of jeans – </span><b><strong class="TextEditorTheme__textBold" style="white-space: pre-wrap;">stylish enough for a coffee date but tough enough for a nature walk. Win-win!</strong></b></p><p class="TextEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">Think of this jacket as your new best friend. Always there when you need it, never letting you down, and making you feel fantastic. It won’t complain if you change your plans last minute – it’s just ready to go.</span></p><p class="TextEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">And here’s the kicker: it’s eco-friendly. Made with materials kind to the planet, so you can feel good about your choice.</span></p><p class="TextEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">With this jacket, you’re always prepared. Surprise rain shower? You’ve got this. Unexpected outdoor invite? You’re ready. </span><b><strong class="TextEditorTheme__textBold" style="white-space: pre-wrap;">It’s like having a superpower – the power to enjoy life, come rain or shine.</strong></b></p><p class="TextEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">So, what do you say? Ready to make every day an “oh, this old thing?” kind of day? Your future self will thank you. This jacket isn’t just a purchase – it’s a whole new way of living. And honey, you deserve it!</span></p><p class="TextEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">Let’s make bad weather days a thing of the past. Your new favorite jacket is waiting for you.</span></p><p class="TextEditorTheme__paragraph" dir="ltr"><b><strong class="TextEditorTheme__textBold" style="white-space: pre-wrap;">Shop now and experience the difference.</strong></b></p>',
    //   highlights: {
    //     keyPoints: [
    //       {
    //         index: 1,
    //         text: "Stay warm and dry in any weather.",
    //       },
    //       {
    //         text: "Look great for coffee dates or city exploring in the rain.",
    //         index: 2,
    //       },
    //       {
    //         text: "Move comfortably all day long.",
    //         index: 3,
    //       },
    //     ],
    //     headline:
    //       '<p class="TextEditorTheme__paragraph" dir="ltr"><b><strong class="TextEditorTheme__textBold" style="white-space: pre-wrap;">Weather keeping you indoors?</strong></b><span style="white-space: pre-wrap;"> Time to break free. Say ‘yes’ to adventures with our </span><i><b><strong class="TextEditorTheme__textBold TextEditorTheme__textItalic" style="white-space: pre-wrap;">all-weather jacket.</strong></b></i></p>',
    //   },
    //   pricing: {
    //     salePrice: 14.99,
    //     basePrice: 21.99,
    //     discountPercentage: 36,
    //   },
    //   images: {
    //     gallery: [
    //       "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/a29326a077e220c1e15738bf1de23a0f.jpg?imageView2/2/w/800/q/70/format/webp",
    //       "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/faea6cf32f753464ed5c1eef962aa663.jpg?imageView2/2/w/800/q/70/format/webp",
    //       "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/1a9ebc84fd63acda663c10ae31eba549.jpg?imageView2/2/w/800/q/70/format/webp",
    //       "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/9aa150bf3f09ed747f4feab7e4762e94.jpg?imageView2/2/w/800/q/70/format/webp",
    //     ],
    //     main: "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/2bdc46577e09529eae927dc850f2a62e.jpg?imageView2/2/w/800/q/70/format/webp",
    //   },
    //   options: {
    //     colors: [
    //       {
    //         name: "Pink",
    //         image:
    //           "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/2bdc46577e09529eae927dc850f2a62e.jpg?imageView2/2/w/800/q/70/format/webp",
    //       },
    //       {
    //         name: "Purple",
    //         image:
    //           "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/c351bbef9bc014fe53769cce7bd8a985.jpg?imageView2/2/w/800/q/70/format/webp",
    //       },
    //       {
    //         image:
    //           "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/1b9cc2ef7d0250bab4c916ece31c06ec.jpg?imageView2/2/w/800/q/70/format/webp",
    //         name: "Turquoise",
    //       },
    //       {
    //         name: "Black",
    //         image:
    //           "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/314892ee24b07a88b7417acbba9e0ae8.jpg?imageView2/2/w/800/q/70/format/webp",
    //       },
    //     ],
    //     sizes: {
    //       inches: {
    //         rows: [
    //           {
    //             Bust: "33.9-35.5",
    //             Size: "S",
    //             Waist: "26-27.6",
    //             US: "4",
    //             Height: "5'5\"-5'7\"",
    //             Hips: "35.9-37.4",
    //           },
    //           {
    //             Size: "M",
    //             Hips: "37.4-39",
    //             US: "6",
    //             Bust: "35.5-37",
    //             Height: "5'7\"-5'9\"",
    //             Waist: "27.6-29.2",
    //           },
    //           {
    //             Bust: "37.4-39.8",
    //             US: "8/10",
    //             Hips: "39.4-41.8",
    //             Height: "5'9\"-5'11\"",
    //             Size: "L",
    //             Waist: "29.6-31.9",
    //           },
    //           {
    //             Height: "5'9\"-5'11\"",
    //             Size: "XL",
    //             US: "12",
    //             Waist: "31.9-34.3",
    //             Hips: "41.8-44.1",
    //             Bust: "39.8-42.2",
    //           },
    //         ],
    //         columns: [
    //           {
    //             label: "Size",
    //             order: 1,
    //           },
    //           {
    //             order: 2,
    //             label: "US",
    //           },
    //           {
    //             order: 3,
    //             label: "Bust",
    //           },
    //           {
    //             order: 4,
    //             label: "Waist",
    //           },
    //           {
    //             order: 5,
    //             label: "Hips",
    //           },
    //           {
    //             label: "Height",
    //             order: 6,
    //           },
    //         ],
    //       },
    //       centimeters: {
    //         rows: [
    //           {
    //             US: "4",
    //             Height: "165-170",
    //             Size: "S",
    //             Bust: "86-90",
    //             Waist: "66-70",
    //             Hips: "91-95",
    //           },
    //           {
    //             US: "6",
    //             Height: "170-175",
    //             Size: "M",
    //             Hips: "95-99",
    //             Bust: "90-94",
    //             Waist: "70-74",
    //           },
    //           {
    //             Height: "175-180",
    //             Bust: "95-101",
    //             Size: "L",
    //             Waist: "75-81",
    //             US: "8/10",
    //             Hips: "100-106",
    //           },
    //           {
    //             US: "12",
    //             Waist: "81-87",
    //             Size: "XL",
    //             Hips: "106-112",
    //             Height: "175-180",
    //             Bust: "101-107",
    //           },
    //         ],
    //         columns: [
    //           {
    //             order: 1,
    //             label: "Size",
    //           },
    //           {
    //             order: 2,
    //             label: "US",
    //           },
    //           {
    //             label: "Bust",
    //             order: 3,
    //           },
    //           {
    //             order: 4,
    //             label: "Waist",
    //           },
    //           {
    //             label: "Hips",
    //             order: 5,
    //           },
    //           {
    //             label: "Height",
    //             order: 6,
    //           },
    //         ],
    //       },
    //     },
    //   },
    //   upsell: "72549",
    //   updatedAt: "2024-08-10 20:01:03",
    //   visibility: "PUBLISHED",
    //   index: 3,
    // };

    // setSelectedProduct(item, isInCart, productInCart);
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

  const { isQuickviewOpen } = useQuickviewStore((state) => ({
    isQuickviewOpen: state.isVisible,
  }));

  const { isInCart, productInCart, selectedProduct, setSelectedProduct } =
    useQuickviewStore((state) => ({
      selectedProduct: state.selectedProduct,
      setSelectedProduct: state.setSelectedProduct,
      isInCart: state.isInCart,
      productInCart: state.productInCart,
    }));

  useEffect(() => {
    console.log("Here you go...");
    console.log(selectedProduct);
  }, []);

  useEffect(() => {
    if (isQuickviewOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isQuickviewOpen]);

  const isVisible = isQuickviewOpen && selectedProduct;

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
                  <p className="text-sm text-gray">{selectedProduct.name}</p>
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
                            className="flex items-start gap-2 mb-2 last:mb-0"
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
                  <button className="text-sm min-[896px]:text-base inline-block text-center align-middle h-[44px] min-[896px]:h-12 w-full border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-300 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]">
                    Yes, Let's Upgrade
                  </button>
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
