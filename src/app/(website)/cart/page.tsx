import { DiscoveryProducts } from "@/components/website/DiscoveryProducts";
import { RemoveFromCartButton } from "@/components/website/RemoveFromCartButton";
import ShowAlert from "@/components/website/ShowAlert";
import { CheckmarkIcon, TrashIcon } from "@/icons";
import { getCart, getDiscoveryProducts, getProductsByIds } from "@/lib/getData";
import { formatThousands } from "@/lib/utils";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { PiShieldCheckBold } from "react-icons/pi";
import { TbLock, TbTruck } from "react-icons/tb";
import { DashSpinner } from "@/ui/Spinners/DashSpinner";
import clsx from "clsx";

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
      options: {
        colors: Array<{
          name: string;
          image: string;
        }>;
        sizes: {
          inches: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
          centimeters: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
        };
      };
    }[];
  };
};

type CartType = {
  id: string;
  device_identifier: string;
  products: Array<{
    baseProductId: string;
    variantId: string;
    size: string;
    color: string;
  }>;
};

export default async function Cart() {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;
  const cart = await getCart(deviceIdentifier);
  const discoveryProducts = await getDiscoveryProducts({ limit: 10 });

  const productIds = cart
    ? cart.products.map((product) => product.baseProductId)
    : [];

  const baseProducts = (await getProductsByIds({
    ids: productIds,
    fields: ["id", "name", "slug", "pricing", "images", "options"],
    visibility: "PUBLISHED",
  })) as ProductType[];

  const cartProducts = cart?.products
    .map((cartProduct) => {
      const baseProduct = baseProducts.find(
        (product) => product.id === cartProduct.baseProductId
      );

      const colorImage = baseProduct?.options?.colors.find(
        (colorOption) => colorOption.name === cartProduct.color
      )?.image;

      return baseProduct
        ? {
            baseProductId: baseProduct.id,
            name: baseProduct.name,
            slug: baseProduct.slug,
            pricing: baseProduct.pricing,
            mainImage: colorImage || baseProduct.images.main,
            variantId: cartProduct.variantId,
            size: cartProduct.size,
            color: cartProduct.color,
          }
        : null;
    })
    .filter((product) => product !== null);

  return (
    <>
      <div className="h-screen overflow-x-hidden overflow-y-auto custom-scrollbar">
        <nav className="h-16 border-b">
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
            <div className="flex items-center gap-[10px] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
              {!cartProducts || cartProducts.length === 0 ? (
                <h2 className="font-semibold text-lg">Your cart is empty</h2>
              ) : (
                <>
                  <h2 className="font-semibold text-lg">Cart</h2>
                  <span className="font-medium text-sm text-green">
                    Free shipping
                  </span>
                </>
              )}
            </div>
          </div>
        </nav>
        <div className="max-w-[968px] mx-auto flex flex-col gap-10">
          <div className="mx-auto">
            {!cartProducts || cartProducts.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-lg">
                <Image
                  src="/icons/cart-thin.svg"
                  alt="Cart"
                  width={80}
                  height={80}
                  priority={true}
                />
              </div>
            ) : (
              <div className="relative flex flex-row gap-16 pt-8">
                <div className="min-w-[560px] max-w-[560px] h-max">
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-5">
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                          <CheckmarkIcon className="fill-white" size={16} />
                        </div>
                      </div>
                      <span className="font-semibold">Select all (3)</span>
                    </div>
                    <div className="flex flex-col gap-5">
                      {/* <div className="p-5 flex flex-col gap-5 rounded bg-[#fffbf6] border border-[#fceddf]">
                        <div className="flex gap-5">
                          <div className="flex items-center">
                            <div className="-mt-5 w-5 h-5 rounded-full bg-black flex items-center justify-center">
                              <CheckmarkIcon className="fill-white" size={16} />
                            </div>
                          </div>
                          <div className="h-full w-full pb-5 border-b border-[#fceddf]">
                            <div className="mb-5 flex items-center gap-1">
                              <span className="font-medium">$71.99</span>
                              <span className="text-sm text-amber">
                                (Saved $24.00)
                              </span>
                            </div>
                            <div className="h-[140px]">
                              <div className="shadow-[#fbe6d3_0px_1px_2px_1px] h-full aspect-square flex items-center justify-center rounded-lg overflow-hidden">
                                <Image
                                  src="https://i.pinimg.com/564x/0b/ff/5a/0bff5a0842dd5613e2573efc6de143f8.jpg"
                                  alt="$71.99 (Saved $24.00)"
                                  width={140}
                                  height={140}
                                  priority
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-5">
                          <div className="flex items-center">
                            <div className="-mt-5 w-5 h-5 rounded-full bg-black flex items-center justify-center">
                              <CheckmarkIcon className="fill-white" size={16} />
                            </div>
                          </div>
                          <div className="h-[140px] w-full"></div> #fff5e9
                        </div>
                      </div> */}
                      <div className="flex gap-5">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                            <CheckmarkIcon className="fill-white" size={16} />
                          </div>
                        </div>
                        <div className="relative w-full p-5 flex gap-5 rounded bg-[#fffbf6] border border-[#fceddf]">
                          <div className="shadow-[#fbe6d3_0px_0.5px_2px_1px] min-w-[180px] max-w-[180px] min-h-[180px] max-h-[180px] overflow-hidden rounded-lg flex items-center justify-center">
                            <Image
                              src="https://i.pinimg.com/564x/0b/ff/5a/0bff5a0842dd5613e2573efc6de143f8.jpg"
                              alt="$71.99 (Saved $24.00)"
                              width={180}
                              height={180}
                              priority
                            />
                          </div>
                          <div className="w-full flex flex-col gap-2">
                            <div className="min-w-full h-5 flex items-center justify-between gap-5">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">$71.99</span>
                                <span className="text-sm text-amber">
                                  (Saved $24.00)
                                </span>
                              </div>
                            </div>
                            <div className="text-gray text-xs leading-5">
                              Cat Backpack{" "}
                              <span className="text-[#cfcfcf]">•</span> Stripe
                              Tee <span className="text-[#cfcfcf]">•</span>{" "}
                              Button Skirt{" "}
                              <span className="text-[#cfcfcf]">•</span> Adidas
                              Sneakers <span className="text-[#cfcfcf]">•</span>{" "}
                              Polo Cap
                            </div>
                          </div>
                          <button
                            className={clsx(
                              "absolute right-3 top-3 min-w-8 max-w-8 min-h-8 max-h-8 rounded-full flex items-center justify-center ease-in-out duration-300 transition hover:bg-[#fceddf]"
                            )}
                          >
                            <TrashIcon size={18} className="fill-gray" />
                          </button>
                        </div>
                      </div>
                      {(cartProducts || []).map(
                        ({
                          baseProductId,
                          variantId,
                          name,
                          slug,
                          pricing,
                          mainImage,
                          color,
                          size,
                        }) => (
                          <div key={variantId} className="flex gap-5">
                            <div className="flex items-center">
                              <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                                <CheckmarkIcon
                                  className="fill-white"
                                  size={16}
                                />
                              </div>
                            </div>
                            <div className="min-w-32 max-w-32 min-h-32 max-h-32 overflow-hidden rounded-lg flex items-center justify-center">
                              <Image
                                src={mainImage}
                                alt={name}
                                width={128}
                                height={128}
                                priority
                              />
                            </div>
                            <div className="w-full flex flex-col gap-1">
                              <div className="min-w-full h-5 flex items-center justify-between gap-5">
                                <Link
                                  href={`${slug}-${baseProductId}`}
                                  className="text-sm line-clamp-1"
                                >
                                  {name}
                                </Link>
                                <RemoveFromCartButton variantId={variantId} />
                              </div>
                              <span className="text-sm text-gray">
                                {color} / {size}
                              </span>
                              <div className="mt-2 w-max flex items-center justify-center">
                                {Number(pricing.salePrice) ? (
                                  <div className="flex items-center gap-[6px]">
                                    <span className="font-medium">
                                      $
                                      {formatThousands(
                                        Number(pricing.salePrice)
                                      )}
                                    </span>
                                    <span className="text-xs text-gray line-through mt-[2px]">
                                      $
                                      {formatThousands(
                                        Number(pricing.basePrice)
                                      )}
                                    </span>
                                    <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-[10px] px-[5px] flex items-center justify-center">
                                      -{pricing.discountPercentage}%
                                    </span>
                                  </div>
                                ) : (
                                  <p className="font-medium">
                                    $
                                    {formatThousands(Number(pricing.basePrice))}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="min-w-[340px] max-w-[340px] sticky top-16 h-max flex flex-col gap-4">
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
                      <span className="text-sm text-gray">
                        Free Shipping for You
                      </span>
                    </div>
                  </div>
                  <div className="mb-2 flex items-center gap-1">
                    <span className="font-medium">Total (5 Items):</span>
                    <span className="font-bold text-xl">$108.99</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="h-[20px] rounded-[3px] flex items-center justify-center">
                      <Image
                        src="/images/payment-methods/visa.svg"
                        alt="Visa"
                        width={34}
                        height={34}
                        priority={true}
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
                      />
                    </div>
                    <div className="ml-[5px] h-[20px] overflow-hidden rounded-[3px] flex items-center justify-center">
                      <Image
                        src="/images/payment-methods/american-express.png"
                        alt="American Express"
                        width={60}
                        height={20}
                        priority={true}
                      />
                    </div>
                    <div className="ml-[10px] h-[20px] rounded-[3px] flex items-center justify-center">
                      <Image
                        src="/images/payment-methods/discover.svg"
                        alt="Discover"
                        width={64}
                        height={14}
                        priority={true}
                      />
                    </div>
                    <div className="ml-[10px] h-[20px] rounded-[3px] flex items-center justify-center">
                      <Image
                        src="/images/payment-methods/diners-club-international.svg"
                        alt="Diners Club International"
                        width={68}
                        height={10}
                        priority={true}
                      />
                    </div>
                  </div>
                  <button className="w-full h-12 italic font-extrabold text-xl bg-sky-700 text-white rounded-full flex items-center justify-center">
                    PayPal
                  </button>
                </div>
              </div>
            )}
          </div>
          <DiscoveryProducts
            heading="Add These to Your Cart"
            products={discoveryProducts as ProductWithUpsellType[]}
            cart={cart as CartType}
          />
        </div>
      </div>
      <ShowAlert />
    </>
  );
}
