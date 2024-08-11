import Options from "@/components/website/Product/Options";
import ImageCarousel from "@/components/website/Product/ImageCarousel";
import { CartIcon, CheckmarkIcon, ChevronLeftIcon } from "@/icons";
import Images from "@/components/website/Product/Images";
import Image from "next/image";
import StickyBar from "@/components/website/Product/StickyBar";
import Link from "next/link";
import { cookies } from "next/headers";
import config from "@/lib/config";
import SizeChartOverlay from "@/components/website/Product/SizeChartOverlay";
import styles from "./styles.module.css";
import { getProduct, getProductWithUpsell } from "@/lib/getData";
import { formatThousands } from "@/lib/utils";
import "@/components/shared/TextEditor/theme/index.css";

type ColumnType = { label: string; order: number };
type RowType = { [key: string]: string };

type SizeChartType = {
  inches: {
    columns: ColumnType[];
    rows: RowType[];
  };
  centimeters: {
    columns: ColumnType[];
    rows: RowType[];
  };
};

type KeyPointsType = { index: number; text: string };

type PricingType = {
  salePrice: number;
  basePrice: number;
  discountPercentage: number;
};

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

type ProductType = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  highlights: {
    headline: string;
    keyPoints: KeyPointsType[];
  };
  pricing: PricingType;
  images: {
    main: string;
    gallery: string[];
  };
  options: {
    colors: Array<{
      name: string;
      image: string;
    }>;
    sizes: SizeChartType;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
  createdAt: string;
  updatedAt: string;
  sourceInfo: {
    platform: string;
    platformUrl: string;
    store: string;
    storeId: string;
    storeUrl: string;
    productUrl: string;
  };
  upsell: UpsellType;
  averageOrderValueBooster?: averageOrderValueBoosterType;
  frequentlyBoughtTogether?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
};

type ProductInCartType = {
  id: string;
  color: string;
  size: string;
};

async function getCart() {
  const deviceIdentifier = cookies().get("device_identifier")?.value;

  if (!deviceIdentifier) return null;

  try {
    const response = await fetch(
      `${config.BASE_URL}/api/carts/${deviceIdentifier}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (Object.keys(data).length === 0) return null;

    return data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

export default async function ProductDetails({
  params,
}: {
  params: { slug: string };
}) {
  const isValidSlug = (input: string): boolean => {
    const regex = /^[a-zA-Z0-9-]+-\d{5}$/;
    return regex.test(input);
  };

  if (!isValidSlug(params.slug)) {
    return <div>404 - page not found</div>;
  }

  const productId = params.slug.split("-").pop() as string;
  const product = (await getProductWithUpsell({
    id: productId,
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

  const existingCart = await getCart();
  const isInCart = existingCart?.products.some(
    (product: any) => product.id === id
  );

  let productInCart;

  if (isInCart) {
    productInCart = existingCart.products.find(
      (p: ProductInCartType) => p.id === id
    );
  }

  return (
    <>
      <nav className="hidden md:block w-full max-h-[116px] md:max-h-16 border-b bg-white">
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
              href="/shop"
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
          <div className="absolute right-4 top-2 md:relative md:right-auto md:top-auto min-w-[160px] w-[160px] h-12 flex items-center justify-end *:h-12 *:w-12 *:rounded-full *:flex *:items-center *:justify-center *:ease-in-out *:transition *:duration-300">
            <Link
              href="/cart"
              className="active:bg-lightgray lg:hover:bg-lightgray"
            >
              <CartIcon size={26} />
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
                  <p className="text-sm text-gray">
                    High Waisted Running Shorts
                  </p>
                  <div className="flex flex-col gap-4">
                    <p className="text-lg leading-[26px]">
                      <strong className="font-bold text-lg leading-[26px]">
                        Struggling with uncomfortable shorts during workouts?
                      </strong>{" "}
                      Say no more, our shorts guarantee{" "}
                      <strong>
                        <em className="text-lg leading-[26px]">
                          comfort and style
                        </em>
                      </strong>{" "}
                      for every activity!
                    </p>
                    <ul className="text-sm list-inside *:leading-[25px]">
                      <li className="flex items-start gap-2">
                        <CheckmarkIcon
                          className="fill-green mt-[3px] -ml-[1px]"
                          size={19}
                        />
                        <span>Quick-dry fabric for cool comfort.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckmarkIcon
                          className="fill-green mt-[3px] -ml-[1px]"
                          size={19}
                        />
                        <span>Double layer design for better movement.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckmarkIcon
                          className="fill-green mt-[3px] -ml-[1px]"
                          size={19}
                        />
                        <span>Zipper pocket to secure your phone.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckmarkIcon
                          className="fill-green mt-[3px] -ml-[1px]"
                          size={19}
                        />
                        <span>Ideal for running, gym, and casual wear.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="w-max flex items-center justify-center mt-2">
                      {Number(pricing.salePrice) ? (
                        <div className="flex items-center gap-[6px]">
                          <span className="font-bold">
                            ${formatThousands(Number(pricing.salePrice))}
                          </span>
                          <span className="text-xs text-gray line-through mt-[2px]">
                            ${formatThousands(Number(pricing.basePrice))}
                          </span>
                          <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-[10px] mt-[2px] py-1 px-[5px]">
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
                      cartInfo={{
                        isInCart,
                        productInCart,
                      }}
                      productInfo={{
                        id,
                        name,
                        pricing,
                        images,
                        options,
                      }}
                    />
                  </div>
                </div>
                <div
                  className={`${styles.customBorder} mt-7 pt-5 pb-[26px] px-6 w-max rounded-md select-none bg-white`}
                >
                  <div className="w-full">
                    <div>
                      <h2 className="font-black text-center text-[21px] text-red leading-6 [letter-spacing:-1px] [word-spacing:2px] [text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)] w-[248px] mx-auto">
                        UPGRADE MY ORDER
                      </h2>
                      <div className="mt-1 text-center font-medium text-amber-dimmed">
                        $137.99 (42% Off)
                      </div>
                    </div>
                    <div className="mt-3 h-[210px] aspect-square mx-auto overflow-hidden">
                      <Image
                        src="https:i.pinimg.com/564x/ab/d7/1b/abd71b557fc77916f1570da50c0325a8.jpg"
                        alt="Upgrade order"
                        width={240}
                        height={240}
                        priority
                      />
                    </div>
                    <div className="w-[200px] mx-auto mt-5 text-xs leading-6 [word-spacing:1px]">
                      <ul className="*:flex *:justify-between">
                        <li>
                          <p className="text-gray">Shorts</p>
                          <p>
                            <span className="font-semibold">$67.99</span>{" "}
                            <span className="line-through text-gray">
                              $79.99
                            </span>
                          </p>
                        </li>
                        <li>
                          <p className="text-gray">Backpack</p>
                          <p>
                            <span className="font-semibold">$41.99</span>{" "}
                            <span className="line-through text-gray">
                              $99.99
                            </span>
                          </p>
                        </li>
                        <li>
                          <p className="text-gray">Sneakers</p>
                          <p>
                            <span className="font-semibold">$29.99</span>{" "}
                            <span className="line-through text-gray">
                              $69.99
                            </span>
                          </p>
                        </li>
                        <li>
                          <p className="text-gray">Hoodie</p>
                          <p>
                            <span className="font-semibold">$79.99</span>{" "}
                            <span className="line-through text-gray">
                              $189.99
                            </span>
                          </p>
                        </li>
                        <li className="mt-2 flex items-center rounded font-semibold">
                          <p className="mx-auto">You Save $100.00</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="w-full mt-12 flex flex-col gap-12">
                  <div>
                    <h2 className="text-[21px] leading-8 mb-4 font-bold">
                      The Next-Gen Blender
                    </h2>
                    <p className="leading-7">
                      BlendJet 2 serves up big blender power on the go. We
                      created the BlendJet 2 portable blender so you can make{" "}
                      <strong>anything you want, anywhere in the world</strong>{" "}
                      — from a mountaintop to your kitchen countertop. It's easy
                      and convenient to use at home, at work, outdoors, at the
                      gym, in the car, at the beach, on vacation or wherever the
                      day takes you.
                    </p>
                    <div>
                      <br />
                    </div>
                    <div className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center">
                      <Image
                        src="https://i.pinimg.com/564x/8e/fe/b1/8efeb1b9afef852636be660f109fa802.jpg"
                        alt="Fruits"
                        width={580}
                        height={580}
                        priority={true}
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-[21px] leading-8 mb-4 font-bold">
                      Patented TurboJet Technology
                    </h2>
                    <p className="leading-7">
                      Traditional blenders only use their blades to blend, but
                      we invented a new method that makes every other blender
                      obsolete. Our secret weapon? BlendJet 2's stainless steel
                      blades are offset from the center of the base, which
                      creates a tornado effect that blasts ingredients into the
                      back of the jar 275 times per second, resulting in{" "}
                      <strong>dramatically better blending.</strong>
                      This technology — combined with a more powerful motor and
                      doubled battery capacity — makes BlendJet 2{" "}
                      <strong>
                        five times more powerful than BlendJet One.
                      </strong>
                    </p>
                    <div>
                      <br />
                    </div>
                    <div className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center">
                      <Image
                        src="https://i.pinimg.com/564x/53/be/0c/53be0c721aa59013e6251d64f54ea01d.jpg"
                        alt="Fruits"
                        width={580}
                        height={580}
                        priority={true}
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-[21px] leading-8 mb-4 font-bold">
                      Perfect for Everything
                    </h2>
                    <p className="leading-7">
                      BlendJet 2 makes smoothie-bar-quality beverages,
                      silky-smooth protein shakes, top-shelf mixed drinks and
                      creamy frozen lattes, plus milkshakes, slushies, baby
                      food, dips, dressings, sauces,{" "}
                      <strong>and so much more.</strong> We'll send a new recipe
                      video straight to your inbox each week to inspire
                      creativity and ensure you get the most out of your
                      BlendJet 2.
                    </p>
                    <div>
                      <br />
                    </div>
                    <div className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center">
                      <Image
                        src="https://i.pinimg.com/564x/33/d3/9b/33d39bb6a10b39ebe4b96b6aa56d5b84.jpg"
                        alt="Fruits"
                        width={580}
                        height={580}
                        priority={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[72px] pt-2 pb-5 px-[6px] min-[350px]:px-2 bg-white">
              <div className="max-w-[580px] mx-auto flex gap-[6px] min-[350px]:gap-2">
                <button className="leading-5 text-[13px] min-[340px]:text-sm font-semibold w-full h-[44px] rounded-full ease-in-out duration-150 transition border border-[rgb(150,150,150)] hover:border-[rgb(80,80,80)] active:border-[rgb(150,150,150)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.16)]">
                  Add to Cart
                </button>
                <button className="leading-5 text-[13px] min-[340px]:text-sm inline-block text-center align-middle h-[44px] w-full border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-300 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]">
                  Yes, Let's Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
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
                      <div className="w-max flex items-center justify-center mt-2">
                        {Number(pricing.salePrice) ? (
                          <div className="flex items-center gap-[6px]">
                            <span className="font-bold">
                              ${formatThousands(Number(pricing.salePrice))}
                            </span>
                            <span className="text-xs text-gray line-through mt-[2px]">
                              ${formatThousands(Number(pricing.basePrice))}
                            </span>
                            <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-[10px] mt-[2px] py-1 px-[5px]">
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
                        cartInfo={{
                          isInCart,
                          productInCart,
                        }}
                        productInfo={{
                          id,
                          name,
                          pricing,
                          images,
                          options,
                        }}
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
            <div className="w-full px-[70px] mx-auto">
              <div className="w-[580px] flex flex-col gap-12">
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
      <StickyBar
        productInfo={{
          pricing,
          upsell,
          mainImage: images.main,
          name,
        }}
        Options={
          <Options
            cartInfo={{
              isInCart,
              productInCart,
            }}
            productInfo={{
              id,
              name,
              pricing,
              images,
              options,
            }}
          />
        }
      />
      <SizeChartOverlay
        productInfo={{
          id,
          name,
          pricing,
          images,
          options,
        }}
      />
    </>
  );
}
