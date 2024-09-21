import { RemoveFromCartButton } from "@/components/website/RemoveFromCartButton";
import ShowAlert from "@/components/website/ShowAlert";
import { CheckmarkIcon, TrashIcon } from "@/icons";
import { getCart, getProductsByIds, getUpsell } from "@/lib/getData";
import { formatThousands } from "@/lib/utils";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { PiShieldCheckBold } from "react-icons/pi";
import { TbLock, TbTruck } from "react-icons/tb";
import clsx from "clsx";

export default async function Cart() {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;

  const { productItems, upsellItems } = await getCartItems(deviceIdentifier);

  const productIds = productItems
    .map((product) => product.baseProductId)
    .filter(Boolean) as string[];

  const [baseProducts, cartUpsells] = await Promise.all([
    getBaseProducts(productIds),
    getCartUpsells(upsellItems),
  ]);

  const cartProducts = mapCartProductsToBaseProducts(
    productItems,
    baseProducts
  );

  const sortedCartItems = [...cartProducts, ...cartUpsells].sort(
    (a, b) => a.index - b.index
  );

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
              {!sortedCartItems || sortedCartItems.length === 0 ? (
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
            {!sortedCartItems || sortedCartItems.length === 0 ? (
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
                      <span className="font-semibold">
                        Select all ({sortedCartItems.length})
                      </span>
                    </div>
                    <div className="flex flex-col gap-5">
                      {sortedCartItems.map((item) => {
                        if (item.type === "product") {
                          return (
                            <div key={item.index} className="flex gap-5">
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
                                  src={item.mainImage}
                                  alt={item.name}
                                  width={128}
                                  height={128}
                                  priority
                                />
                              </div>
                              <div className="w-full pr-3 flex flex-col gap-1">
                                <div className="min-w-full h-5 flex items-center justify-between gap-5">
                                  <Link
                                    href={`${item.slug}-${item.baseProductId}`}
                                    className="text-sm line-clamp-1"
                                  >
                                    {item.name}
                                  </Link>
                                  <RemoveFromCartButton
                                    variantId={item.variantId}
                                  />
                                </div>
                                <span className="text-sm text-gray">
                                  {item.color} / {item.size}
                                </span>
                                <div className="mt-2 w-max flex items-center justify-center">
                                  {Number(item.pricing.salePrice) ? (
                                    <div className="flex items-center gap-[6px]">
                                      <span className="font-medium">
                                        $
                                        {formatThousands(
                                          Number(item.pricing.salePrice)
                                        )}
                                      </span>
                                      <span className="text-xs text-gray line-through mt-[2px]">
                                        $
                                        {formatThousands(
                                          Number(item.pricing.basePrice)
                                        )}
                                      </span>
                                      <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-[10px] px-[5px] flex items-center justify-center">
                                        -{item.pricing.discountPercentage}%
                                      </span>
                                    </div>
                                  ) : (
                                    <p className="font-medium">
                                      $
                                      {formatThousands(
                                        Number(item.pricing.basePrice)
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        } else if (item.type === "upsell") {
                          return (
                            <div key={item.index} className="flex gap-5">
                              <div className="flex items-center">
                                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                                  <CheckmarkIcon
                                    className="fill-white"
                                    size={16}
                                  />
                                </div>
                              </div>
                              <div className="relative w-full p-5 flex gap-5 rounded-lg bg-[#fffbf6] border border-[#fceddf]">
                                <div className="flex flex-col gap-2">
                                  <div className="min-w-full h-5 flex items-center justify-between gap-5">
                                    <div className="flex items-center gap-1">
                                      {item.pricing.salePrice ? (
                                        <>
                                          <span className="font-medium">
                                            $
                                            {formatThousands(
                                              Number(item.pricing.salePrice)
                                            )}
                                          </span>
                                          <span className="text-amber text-sm">
                                            (Saved $
                                            {calculateSavings(item.pricing)})
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="font-medium">
                                            $
                                            {formatThousands(
                                              Number(item.pricing.basePrice)
                                            )}
                                          </span>
                                          <span className="text-amber text-xs border border-amber ml-[2px] h-[18px] leading-none px-1 rounded flex items-center justify-center">
                                            Limited time offer
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-gray text-xs leading-5 max-w-[360px]">
                                    {item.products.map((product, index) => (
                                      <span key={product.id}>
                                        {product.name}
                                        {index < item.products.length - 1 && (
                                          <span className="text-[#cfcfcf]">
                                            {" "}
                                            •{" "}
                                          </span>
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {item.products.map((product) => (
                                      <div
                                        key={product.id}
                                        className="min-w-32 max-w-32 h-32 rounded-md overflow-hidden border border-[#fceddf] bg-white flex items-center justify-center"
                                      >
                                        <Image
                                          src={product.mainImage}
                                          alt={product.name}
                                          width={128}
                                          height={128}
                                          priority
                                        />
                                      </div>
                                    ))}
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
                          );
                        }
                        return null;
                      })}
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
          {/* <DiscoveryProducts
            heading="Add These to Your Cart"
            products={discoveryProducts as ProductWithUpsellType[]}
            cart={cart as CartType}
          /> */}
        </div>
      </div>
      <ShowAlert />
    </>
  );
}

const calculateSavings = (pricing: ProductType["pricing"]) =>
  (Number(pricing.basePrice) - Number(pricing.salePrice)).toFixed(2);

const getCartItems = async (deviceIdentifier: string | undefined) => {
  const cart = await getCart(deviceIdentifier);

  return {
    productItems: cart?.items.filter((item) => item.type === "product") || [],
    upsellItems: cart?.items.filter((item) => item.type === "upsell") || [],
  };
};

const getBaseProducts = async (productIds: string[]) =>
  getProductsByIds({
    ids: productIds,
    fields: ["id", "name", "slug", "pricing", "images", "options"],
    visibility: "PUBLISHED",
  }) as Promise<ProductType[]>;

[
  {
    variantId: "27694",
    index: 1,
    baseProductId: "91062",
    size: "S",
    type: "product",
    color: "Pink",
  },
];

const mapCartProductsToBaseProducts = (
  cartProducts: Array<{
    index: number;
    type: "product";
    variantId: string;
    baseProductId: string;
    size: string;
    color: string;
  }>,
  baseProducts: ProductType[]
) =>
  cartProducts
    .map((cartProduct) => {
      const baseProduct = baseProducts.find(
        (product) => product.id === cartProduct.baseProductId
      );

      if (!baseProduct) return null;

      const colorImage = baseProduct.options?.colors.find(
        (colorOption) => colorOption.name === cartProduct.color
      )?.image;

      return {
        baseProductId: baseProduct.id,
        name: baseProduct.name,
        slug: baseProduct.slug,
        pricing: baseProduct.pricing,
        mainImage: colorImage || baseProduct.images.main,
        variantId: cartProduct.variantId,
        size: cartProduct.size,
        color: cartProduct.color,
        index: cartProduct.index || 0,
        type: cartProduct.type,
      };
    })
    .filter(
      (product): product is NonNullable<typeof product> => product !== null
    );

const getCartUpsells = async (
  upsellItems: Array<{
    type: "upsell";
    index: number;
    baseUpsellId: string;
    products: Array<{
      id: string;
      size: string;
      color: string;
    }>;
  }>
) =>
  Promise.all(
    upsellItems.map(async (upsell) => {
      const upsellData = (await getUpsell({
        id: upsell.baseUpsellId,
      })) as UpsellType;

      const detailedProducts = upsell.products
        .map((selectedProduct) => {
          const baseProduct = upsellData.products.find(
            (product) => product.id === selectedProduct.id
          );

          if (!baseProduct) {
            return null;
          }

          return {
            index: baseProduct.index,
            id: baseProduct.id,
            slug: baseProduct.slug,
            name: baseProduct.name,
            mainImage: baseProduct.mainImage,
            basePrice: baseProduct.basePrice,
            size: selectedProduct.size,
            color: selectedProduct.color,
          };
        })
        .filter((product) => product !== null);

      return {
        baseUpsellId: upsell.baseUpsellId,
        index: upsell.index,
        type: upsell.type,
        mainImage: upsellData?.mainImage,
        pricing: upsellData?.pricing,
        products: detailedProducts,
      };
    })
  );
