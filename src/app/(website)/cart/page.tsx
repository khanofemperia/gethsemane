import { RemoveFromCartButton } from "@/components/website/RemoveFromCartButton";
import ShowAlert from "@/components/website/ShowAlert";
import { CheckmarkIcon } from "@/icons";
import { getCart, getDiscoveryProducts, getProductsByIds } from "@/lib/getData";
import { formatThousands } from "@/lib/utils";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { PiShieldCheckBold } from "react-icons/pi";
import { TbLock, TbTruck } from "react-icons/tb";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { DiscoveryProducts } from "@/components/website/DiscoveryProducts";
import { database } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ResetUpsellReview } from "@/components/website/ResetUpsellReview";

export default async function Cart() {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";

  const [cart, discoveryProducts] = await Promise.all([
    getCart(deviceIdentifier),
    getDiscoveryProducts({ limit: 10 }),
  ]);

  const items = cart?.items || [];
  const productItems = items.filter((item) => item.type === "product");
  const upsellItems = items.filter((item) => item.type === "upsell");

  const productIds = productItems.length
    ? productItems.map((product) => product.baseProductId).filter(Boolean)
    : [];

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

  const calculateTotal = () => {
    const totalBasePrice = sortedCartItems.reduce((total, item) => {
      const itemPrice = item.pricing.salePrice || item.pricing.basePrice;
      const price =
        typeof itemPrice === "number" ? itemPrice : parseFloat(itemPrice);
      return isNaN(price) ? total : total + price;
    }, 0);

    // Round down to the nearest .99
    const roundedTotal =
      totalBasePrice === 0 ? 0 : Math.floor(totalBasePrice) + 0.99;

    return Number(roundedTotal.toFixed(2));
  };

  return (
    <>
      <div
        id="scrollable-parent"
        className="h-screen overflow-x-hidden overflow-y-auto custom-scrollbar"
      >
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
                                    target="_blank"
                                    className="text-sm line-clamp-1"
                                  >
                                    {item.name}
                                  </Link>
                                  <RemoveFromCartButton
                                    type="product"
                                    variantId={item.variantId}
                                  />
                                </div>
                                <span className="text-sm text-gray">
                                  {item.color} / {item.size}
                                </span>
                                <div className="mt-2 w-max flex items-center justify-center">
                                  {Number(item.pricing.salePrice) ? (
                                    <div className="flex items-center gap-[6px]">
                                      <div className="flex items-baseline text-[rgb(168,100,0)]">
                                        <span className="text-[0.813rem] leading-3 font-semibold">
                                          $
                                        </span>
                                        <span className="text-lg font-bold">
                                          {Math.floor(
                                            Number(item.pricing.salePrice)
                                          )}
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
                                    <div className="flex items-baseline">
                                      <span className="text-[0.813rem] leading-3 font-semibold">
                                        $
                                      </span>
                                      <span className="text-lg font-bold">
                                        {Math.floor(
                                          Number(item.pricing.basePrice)
                                        )}
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
                                    <div className="w-max flex items-center justify-center">
                                      {Number(item.pricing.salePrice) ? (
                                        <div className="flex items-center gap-[6px]">
                                          <div className="flex items-baseline text-[rgb(168,100,0)]">
                                            <span className="text-[0.813rem] leading-3 font-semibold">
                                              $
                                            </span>
                                            <span className="text-xl font-bold">
                                              {Math.floor(
                                                Number(item.pricing.salePrice)
                                              )}
                                            </span>
                                            <span className="text-[0.813rem] leading-3 font-semibold">
                                              {(
                                                Number(item.pricing.salePrice) %
                                                1
                                              )
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
                                            {Math.floor(
                                              Number(item.pricing.basePrice)
                                            )}
                                          </span>
                                          <span className="text-[0.813rem] leading-3 font-semibold">
                                            {(
                                              Number(item.pricing.basePrice) % 1
                                            )
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
                                  <div className="text-gray text-xs leading-5 max-w-[360px]">
                                    {item.products.map((product, index) => (
                                      <span key={product.id}>
                                        {product.name}
                                        {index < item.products.length - 1 && (
                                          <span className="text-[rgb(206,206,206)] px-[6px]">
                                            •
                                          </span>
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {item.products.map((product) => (
                                      <div
                                        key={product.id}
                                        className="flex flex-col items-center"
                                      >
                                        <div className="min-w-32 max-w-32 h-32 rounded-md overflow-hidden border border-[#fceddf] bg-white flex items-center justify-center">
                                          <Image
                                            src={product.mainImage}
                                            alt={product.name}
                                            width={128}
                                            height={128}
                                            priority
                                          />
                                        </div>
                                        <div className="text-xs font-medium mt-1">
                                          <span>
                                            {product.color && product.size
                                              ? `${product.color} / ${product.size}`
                                              : product.color
                                              ? product.color
                                              : product.size
                                              ? product.size
                                              : ""}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
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
                    <span className="font-medium">
                      Total ({sortedCartItems.length} Items):
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
            deviceIdentifier={deviceIdentifier}
          />
        </div>
      </div>
      <ShowAlert />
      <QuickviewOverlay />
      <UpsellReviewOverlay cart={cart} />
      <ResetUpsellReview />
    </>
  );
}

const calculateSavings = (pricing: ProductType["pricing"]) =>
  (Number(pricing.basePrice) - Number(pricing.salePrice)).toFixed(2);

const getBaseProducts = async (productIds: string[]) =>
  getProductsByIds({
    ids: productIds,
    fields: ["id", "name", "slug", "pricing", "images", "options"],
    visibility: "PUBLISHED",
  }) as Promise<ProductType[]>;

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
    variantId: string;
    products: Array<{
      id: string;
      size: string;
      color: string;
    }>;
  }>
) => {
  const upsellPromises = upsellItems.map(async (upsell) => {
    const upsellData = (await getUpsell({
      id: upsell.baseUpsellId,
    })) as UpsellType;

    if (!upsellData || !upsellData.products) {
      return null;
    }

    const detailedProducts = upsell.products
      .map((selectedProduct) => {
        const baseProduct = upsellData.products.find(
          (product) => product.id === selectedProduct.id
        );

        if (!baseProduct) return null;

        const colorImage = baseProduct.options?.colors.find(
          (colorOption) => colorOption.name === selectedProduct.color
        )?.image;

        return {
          index: baseProduct.index,
          id: baseProduct.id,
          slug: baseProduct.slug,
          name: baseProduct.name,
          mainImage: colorImage || baseProduct.images.main,
          basePrice: baseProduct.basePrice,
          size: selectedProduct.size,
          color: selectedProduct.color,
        };
      })
      .filter(
        (product): product is NonNullable<typeof product> => product !== null
      );

    if (detailedProducts.length === 0) {
      return null;
    }

    return {
      baseUpsellId: upsell.baseUpsellId,
      variantId: upsell.variantId,
      index: upsell.index,
      type: upsell.type,
      mainImage: upsellData.mainImage,
      pricing: upsellData.pricing,
      products: detailedProducts,
    };
  });

  const results = await Promise.all(upsellPromises);
  return results.filter(
    (result): result is NonNullable<typeof result> => result !== null
  );
};

const getUpsell = async ({
  id,
}: {
  id: string;
}): Promise<Partial<UpsellType> | null> => {
  const documentRef = doc(database, "upsells", id);
  const snapshot = await getDoc(documentRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  const productIds = data.products
    ? data.products.map((p: { id: string }) => p.id)
    : [];

  const products: ProductType[] | null =
    productIds.length > 0
      ? await getProductsByIds({
          ids: productIds,
          fields: ["options", "images"],
          visibility: "PUBLISHED",
        })
      : null;

  if (!products || products.length === 0) {
    return null;
  }

  const updatedProducts = data.products
    .map((product: any) => {
      const matchedProduct = products.find((p) => p.id === product.id);
      return matchedProduct
        ? {
            ...product,
            options: matchedProduct.options ?? [],
          }
        : null;
    })
    .filter((product: any) => product !== null);

  const sortedProducts = updatedProducts.sort(
    (a: any, b: any) => a.index - b.index
  );

  const upsell: Partial<UpsellType> = {
    id: snapshot.id,
    ...data,
    products: sortedProducts,
  };

  return upsell;
};
