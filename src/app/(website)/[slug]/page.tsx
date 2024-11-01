import Options from "@/components/website/Product/Options";
import ImageCarousel from "@/components/website/Product/ImageCarousel";
import { CheckmarkIcon, ChevronLeftIcon } from "@/icons";
import Images from "@/components/website/Product/Images";
import Image from "next/image";
import { cookies } from "next/headers";
import styles from "./styles.module.css";
import { formatThousands } from "@/lib/utils";
import "@/components/shared/TextEditor/theme/index.css";
import { CartAndUpgradeButtons } from "@/components/website/Product/CartAndUpgradeButtons";
import ShowAlert from "@/components/website/ShowAlert";
import { ProductDetailsWrapper } from "@/components/website/ProductDetailsWrapper";
import { SizeChartOverlay } from "@/components/website/Product/SizeChartOverlay";
import clsx from "clsx";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { getCategories } from "@/lib/api/categories";
import { getCart } from "@/lib/api/cart";
import { getProducts } from "@/lib/api/products";

export default async function ProductDetails({
  params,
}: {
  params: { slug: string };
}) {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";

  const [cart, categoriesData, fetchedProducts] = await Promise.all([
    getCart(deviceIdentifier),
    getCategories({ visibility: "HIDDEN" }),
    getProducts({
      ids: [params.slug.split("-").pop() as string],
      fields: [
        "name",
        "pricing",
        "images",
        "options",
        "highlights",
        "upsell",
        "description",
      ],
    }),
  ]);

  const product = fetchedProducts?.[0] as ProductWithUpsellType;

  const {
    id,
    name,
    pricing,
    images,
    options,
    highlights,
    upsell,
    description,
  } = product || {};

  const hasColor = product.options.colors.length > 0;
  const hasSize = Object.keys(product.options.sizes).length > 0;

  return (
    <>
      <ProductDetailsWrapper
        cart={cart}
        deviceIdentifier={deviceIdentifier}
        hasColor={hasColor}
        hasSize={hasSize}
        categoriesData={categoriesData}
        productInfo={{
          id,
          name,
          pricing,
          images,
          options,
          upsell,
        }}
      >
        <main>
          <div className="md:hidden">
            <div className="w-full min-h-screen max-h-screen overflow-hidden flex flex-col">
              <div className="overflow-x-hidden h-[calc(100%-72px)]">
                <div className="w-full max-w-full relative select-none">
                  <button
                    type="button"
                    className="h-9 w-9 bg-black/80 rounded-full flex items-center justify-center absolute top-4 left-5 z-10 transition duration-300 ease-in-out active:bg-black"
                  >
                    <ChevronLeftIcon
                      className="stroke-white mr-[2px]"
                      size={22}
                    />
                  </button>
                  <ImageCarousel images={images} productName={name} />
                </div>
                <div className="max-w-[580px] mx-auto pb-12 pt-5 px-5">
                  <div className="flex flex-col gap-5">
                    <p className="text-sm text-gray">{name}</p>
                    <div className="flex flex-col gap-4">
                      <div
                        className="text-lg leading-[26px] [&>:last-child]:mb-0"
                        dangerouslySetInnerHTML={{
                          __html: highlights.headline || "",
                        }}
                      />
                      <ul className="text-sm list-inside *:leading-5">
                        {highlights.keyPoints
                          .slice()
                          .sort((a, b) => a.index - b.index)
                          .map((point) => (
                            <li
                              key={point.index}
                              className="flex items-start gap-1 mb-2 last:mb-0"
                            >
                              <div className="min-w-4 max-w-4 min-h-5 max-h-5 flex items-center justify-center">
                                <CheckmarkIcon
                                  className="fill-green -ml-1"
                                  size={20}
                                />
                              </div>
                              <span>{point.text}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-5">
                      <div className="w-max flex items-center justify-center">
                        {Number(pricing.salePrice) ? (
                          <div className="flex items-center gap-[6px]">
                            <div
                              className={clsx(
                                "flex items-baseline",
                                !upsell && "text-[rgb(168,100,0)]"
                              )}
                            >
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                $
                              </span>
                              <span className="text-lg font-bold">
                                {Math.floor(Number(pricing.salePrice))}
                              </span>
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                {(Number(pricing.salePrice) % 1)
                                  .toFixed(2)
                                  .substring(1)}
                              </span>
                            </div>
                            <span className="text-[0.813rem] leading-3 text-gray line-through">
                              ${formatThousands(Number(pricing.basePrice))}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline">
                            <span className="text-[0.813rem] leading-3 font-semibold">
                              $
                            </span>
                            <span className="text-lg font-bold">
                              {Math.floor(Number(pricing.basePrice))}
                            </span>
                            <span className="text-[0.813rem] leading-3 font-semibold">
                              {(Number(pricing.basePrice) % 1)
                                .toFixed(2)
                                .substring(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <Options
                        productInfo={{
                          id,
                          name,
                          pricing,
                          images,
                          options,
                        }}
                        isStickyBarInCartIndicator={false}
                        deviceIdentifier={deviceIdentifier}
                      />
                    </div>
                  </div>
                  {upsell && upsell.products && upsell.products.length > 0 && (
                    <div
                      className={`${styles.customBorder} mt-7 pt-5 pb-[26px] px-6 w-max rounded-md select-none bg-white`}
                    >
                      <div className="w-full">
                        <div>
                          <h2 className="mb-1 font-black text-center text-[21px] text-red leading-6 [letter-spacing:-1px] [word-spacing:2px] [text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)] w-[248px] mx-auto">
                            UPGRADE MY ORDER
                          </h2>
                          <div className="w-max mx-auto flex items-center justify-center">
                            {Number(upsell.pricing.salePrice) ? (
                              <div className="flex items-center gap-[6px]">
                                <div className="flex items-baseline text-[rgb(168,100,0)]">
                                  <span className="text-[0.813rem] leading-3 font-semibold">
                                    $
                                  </span>
                                  <span className="text-lg font-bold">
                                    {Math.floor(
                                      Number(upsell.pricing.salePrice)
                                    )}
                                  </span>
                                  <span className="text-[0.813rem] leading-3 font-semibold">
                                    {(Number(upsell.pricing.salePrice) % 1)
                                      .toFixed(2)
                                      .substring(1)}
                                  </span>
                                </div>
                                <span className="text-[0.813rem] leading-3 text-gray line-through">
                                  $
                                  {formatThousands(
                                    Number(upsell.pricing.basePrice)
                                  )}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-baseline text-[rgb(168,100,0)]">
                                <span className="text-[0.813rem] leading-3 font-semibold">
                                  $
                                </span>
                                <span className="text-lg font-bold">
                                  {Math.floor(Number(upsell.pricing.basePrice))}
                                </span>
                                <span className="text-[0.813rem] leading-3 font-semibold">
                                  {(Number(upsell.pricing.basePrice) % 1)
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
                            {upsell.products.map((product, index) => (
                              <li key={index}>
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
                                    $
                                    {formatThousands(Number(product.basePrice))}
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
                  <div className="w-full mt-12">
                    <div
                      className={`
                    [&>p>img]:max-w-[500px] [&>p>img]:rounded-xl [&>p>img]:my-7 
                    [&>:last-child]:mb-0 [&>:first-child]:mt-0 [&>:first-child>img]:mt-0 [&>:last-child>img]:mb-0
                  `}
                      dangerouslySetInnerHTML={{
                        __html: description || "",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="h-[72px] pt-2 pb-5 px-[6px] min-[350px]:px-2 bg-white">
                <div className="max-w-[580px] mx-auto flex gap-[6px] min-[350px]:gap-2">
                  <CartAndUpgradeButtons
                    product={product}
                    cart={cart}
                    hasColor={hasColor}
                    hasSize={hasSize}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block w-max mx-auto">
            <div className="w-full max-w-[945px] pt-5 px-5 min-[1120px]:px-0 flex flex-col gap-12">
              <div className="flex gap-5 items-start justify-start relative">
                <div className="sticky top-5 max-w-[650px] flex flex-col gap-16">
                  <Images images={images} productName={name} />
                </div>
                <div className="sticky top-5 pt-5 min-w-[340px] w-[340px] min-[896px]:min-w-[400px] min-[896px]:w-[400px]">
                  <div>
                    <div className="flex flex-col gap-5">
                      <p className="text-sm text-gray">{name}</p>
                      <div className="flex flex-col gap-4">
                        <div
                          className="text-lg leading-[26px] [&>:last-child]:mb-0"
                          dangerouslySetInnerHTML={{
                            __html: highlights.headline || "",
                          }}
                        />
                        <ul className="text-sm list-inside *:leading-5">
                          {highlights.keyPoints
                            .slice()
                            .sort((a, b) => a.index - b.index)
                            .map((point) => (
                              <li
                                key={point.index}
                                className="flex items-start gap-1 mb-2 last:mb-0"
                              >
                                <div className="min-w-4 max-w-4 min-h-5 max-h-5 flex items-center justify-center">
                                  <CheckmarkIcon
                                    className="fill-green -ml-1"
                                    size={20}
                                  />
                                </div>
                                <span>{point.text}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                      <div className="flex flex-col gap-5">
                        <div className="w-max flex items-center justify-center">
                          {Number(pricing.salePrice) ? (
                            <div className="flex items-center gap-[6px]">
                              <div
                                className={clsx(
                                  "flex items-baseline",
                                  !upsell && "text-[rgb(168,100,0)]"
                                )}
                              >
                                <span className="text-[0.813rem] leading-3 font-semibold">
                                  $
                                </span>
                                <span className="text-lg font-bold">
                                  {Math.floor(Number(pricing.salePrice))}
                                </span>
                                <span className="text-[0.813rem] leading-3 font-semibold">
                                  {(Number(pricing.salePrice) % 1)
                                    .toFixed(2)
                                    .substring(1)}
                                </span>
                              </div>
                              <span className="text-[0.813rem] leading-3 text-gray line-through">
                                ${formatThousands(Number(pricing.basePrice))}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-baseline">
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                $
                              </span>
                              <span className="text-lg font-bold">
                                {Math.floor(Number(pricing.basePrice))}
                              </span>
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                {(Number(pricing.basePrice) % 1)
                                  .toFixed(2)
                                  .substring(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <Options
                          productInfo={{
                            id,
                            name,
                            pricing,
                            images,
                            options,
                          }}
                          isStickyBarInCartIndicator={false}
                          deviceIdentifier={deviceIdentifier}
                        />
                      </div>
                    </div>
                    {upsell &&
                      upsell.products &&
                      upsell.products.length > 0 && (
                        <div
                          className={`${styles.customBorder} mt-7 pt-5 pb-[26px] px-6 w-max rounded-md select-none bg-white`}
                        >
                          <div className="w-full">
                            <div>
                              <h2 className="mb-1 font-black text-center text-[21px] text-red leading-6 [letter-spacing:-1px] [word-spacing:2px] [text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)] w-[248px] mx-auto">
                                UPGRADE MY ORDER
                              </h2>
                              <div className="w-max mx-auto flex items-center justify-center">
                                {Number(upsell.pricing.salePrice) ? (
                                  <div className="flex items-center gap-[6px]">
                                    <div className="flex items-baseline text-[rgb(168,100,0)]">
                                      <span className="text-[0.813rem] leading-3 font-semibold">
                                        $
                                      </span>
                                      <span className="text-lg font-bold">
                                        {Math.floor(
                                          Number(upsell.pricing.salePrice)
                                        )}
                                      </span>
                                      <span className="text-[0.813rem] leading-3 font-semibold">
                                        {(Number(upsell.pricing.salePrice) % 1)
                                          .toFixed(2)
                                          .substring(1)}
                                      </span>
                                    </div>
                                    <span className="text-[0.813rem] leading-3 text-gray line-through">
                                      $
                                      {formatThousands(
                                        Number(upsell.pricing.basePrice)
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-baseline text-[rgb(168,100,0)]">
                                    <span className="text-[0.813rem] leading-3 font-semibold">
                                      $
                                    </span>
                                    <span className="text-lg font-bold">
                                      {Math.floor(
                                        Number(upsell.pricing.basePrice)
                                      )}
                                    </span>
                                    <span className="text-[0.813rem] leading-3 font-semibold">
                                      {(Number(upsell.pricing.basePrice) % 1)
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
                                {upsell.products.map((product, index) => (
                                  <li key={index}>
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
                                        $
                                        {formatThousands(
                                          Number(product.basePrice)
                                        )}
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
                  <div className="sticky left-0 right-0 bottom-0 z-10 mt-6 pt-1 pb-5 shadow-[0_-12px_16px_2px_white] bg-white">
                    <div className="flex gap-2 min-[896px]:gap-3">
                      <CartAndUpgradeButtons
                        product={product}
                        cart={cart}
                        hasColor={hasColor}
                        hasSize={hasSize}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full pr-[70px] mx-auto">
                <div className="w-[580px]">
                  <div
                    className={`
                    [&>p>img]:max-w-[500px] [&>p>img]:rounded-xl [&>p>img]:my-7 
                    [&>:last-child]:mb-0 [&>:first-child]:mt-0 [&>:first-child>img]:mt-0 [&>:last-child>img]:mb-0
                  `}
                    dangerouslySetInnerHTML={{
                      __html: description || "",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
        <SizeChartOverlay
          productInfo={{
            id,
            name,
            pricing,
            images,
            options,
          }}
        />
      </ProductDetailsWrapper>
      <QuickviewOverlay />
      <UpsellReviewOverlay cart={cart} />
      <ShowAlert />
      {/* <PostAddToCartOverlay /> */}
    </>
  );
}
