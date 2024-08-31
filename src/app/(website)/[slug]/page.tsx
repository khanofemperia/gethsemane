import Options from "@/components/website/Product/Options";
import ImageCarousel from "@/components/website/Product/ImageCarousel";
import { CartIcon, CheckmarkIcon, ChevronLeftIcon } from "@/icons";
import Images from "@/components/website/Product/Images";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import SizeChartOverlay from "@/components/website/Product/SizeChartOverlay";
import styles from "./styles.module.css";
import { getCart, getProductWithUpsell } from "@/lib/getData";
import { formatThousands } from "@/lib/utils";
import "@/components/shared/TextEditor/theme/index.css";
import { CartAndUpgradeButtons } from "@/components/website/Product/CartAndUpgradeButtons";
import ShowAlert from "@/components/website/ShowAlert";
import { ProductDetailsWrapper } from "@/components/website/ProductDetailsWrapper";
import { PostAddToCartOverlay } from "@/components/website/PostAddToCartOverlay";

type ProductType = {
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

export default async function ProductDetails({
  params,
}: {
  params: { slug: string };
}) {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;
  const cart = await getCart(deviceIdentifier);
  const itemsInCart = cart ? cart.products.length : 0;

  const product = (await getProductWithUpsell({
    id: params.slug.split("-").pop() as string,
  })) as ProductType;
  const {
    id,
    name,
    pricing,
    images,
    options,
    highlights,
    upsell,
    description,
  } = product;

  const hasColor = product.options.colors.length > 0;
  const hasSize = Object.keys(product.options.sizes).length > 0;

  const productsInCart =
    cart?.products.filter(
      (item: { id: string; color: string; size: string }) =>
        item.id === product.id
    ) || [];

  const inCart = productsInCart.length > 0;
  const cartProducts = productsInCart;

  return (
    <>
      <ProductDetailsWrapper
        inCart={inCart}
        cartProducts={cartProducts}
        hasColor={hasColor}
        hasSize={hasSize}
        productInfo={{
          id,
          name,
          pricing,
          images,
          options,
          upsell,
        }}
      >
        <nav className="hidden md:block w-full max-h-[116px] md:max-h-16 px-8 border-b bg-white">
          <div className="w-full max-w-[1080px] mx-auto py-2 px-5 min-[1120px]:px-0 relative flex gap-1 flex-col md:flex-row">
            <Link
              href="/"
              className="h-12 min-w-[168px] w-[168px] pl-2 md:pl-0 flex items-center"
            >
              <Image
                src="/images/logos/cherlygood_wordmark.svg"
                alt="Cherly Good"
                width={160}
                height={40}
                priority
              />
            </Link>
            <div className="w-full flex items-center justify-center md:pl-6 lg:pl-0 overflow-hidden">
              <Link
                href="/"
                className="flex items-center gap-[10px] px-5 w-full md:max-w-[560px] h-12 rounded-full ease-in-out transition duration-300 bg-[#e9eff6] active:bg-[#c4f8d6] lg:hover:bg-[#c4f8d6]"
              >
                <Image
                  src="/images/other/waving_hand.webp"
                  alt="Cherly Good"
                  width={28}
                  height={28}
                  priority
                />
                <span className="min-[480px]:hidden md:block min-[820px]:hidden font-medium text-gray">
                  Browse the store
                </span>
                <span className="hidden min-[480px]:block md:hidden min-[820px]:block font-medium text-gray">
                  Click here to browse the store
                </span>
              </Link>
            </div>
            <div className="absolute right-4 top-2 md:relative md:right-auto md:top-auto min-w-[160px] w-[160px] h-12 flex items-center justify-end">
              <Link
                href="/cart"
                className="relative h-12 w-12 rounded-full flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray lg:hover:bg-lightgray"
              >
                <CartIcon size={26} />
                {itemsInCart > 0 && (
                  <span className="absolute top-[4px] left-[30px] min-w-5 w-max h-5 px-1 rounded-full text-sm font-medium flex items-center justify-center text-white bg-red">
                    {itemsInCart}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </nav>
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
                      <ul className="text-sm list-inside *:leading-[22px]">
                        {highlights.keyPoints
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
                      <Options
                        productInfo={{
                          id,
                          name,
                          pricing,
                          images,
                          options,
                        }}
                        inCart={inCart}
                        cartProducts={cartProducts}
                      />
                    </div>
                  </div>
                  {upsell && upsell.products.length > 0 && (
                    <div
                      className={`${styles.customBorder} mt-7 pt-5 pb-[26px] px-6 w-max rounded-md select-none bg-white`}
                    >
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
                  <button className="leading-5 text-[13px] min-[340px]:text-sm font-semibold w-full h-[44px] rounded-full ease-in-out duration-150 transition border border-[rgb(150,150,150)] hover:border-[rgb(80,80,80)] active:border-[rgb(150,150,150)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.16)]">
                    Add to Cart
                  </button>
                  <button className="leading-5 text-[13px] min-[340px]:text-sm inline-block text-center align-middle h-[44px] w-full border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-100 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]">
                    Yes, Let's Upgrade
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block px-8">
            <div className="w-full max-w-5xl mx-auto pt-5 pb-16 px-5 min-[1120px]:px-0 flex flex-col gap-16">
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
                        <ul className="text-sm list-inside *:leading-[22px]">
                          {highlights.keyPoints
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
                        <Options
                          productInfo={{
                            id,
                            name,
                            pricing,
                            images,
                            options,
                          }}
                          inCart={inCart}
                          cartProducts={cartProducts}
                        />
                      </div>
                    </div>
                    {upsell && upsell.products.length > 0 && (
                      <div
                        className={`${styles.customBorder} mt-7 pt-5 pb-[26px] px-6 w-max rounded-md select-none bg-white`}
                      >
                        <div className="w-full">
                          <div>
                            <h2 className="font-black text-center text-[21px] text-red leading-6 [letter-spacing:-1px] [word-spacing:2px] [text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)] w-[248px] mx-auto">
                              UPGRADE MY ORDER
                            </h2>
                            <div className="mt-1 text-center font-medium text-amber-dimmed">
                              {upsell.pricing.salePrice
                                ? `$${formatThousands(
                                    Number(upsell.pricing.salePrice)
                                  )} (${
                                    upsell.pricing.discountPercentage
                                  }% Off)`
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
                        productId={product.id}
                        inCart={inCart}
                        cartProducts={cartProducts}
                        hasColor={hasColor}
                        hasSize={hasSize}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full px-[70px] mx-auto">
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
      <ShowAlert />
      {/* <PostAddToCartOverlay /> */}
    </>
  );
}
