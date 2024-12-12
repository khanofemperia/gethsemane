import ShowAlert from "@/components/website/ShowAlert";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { database } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ResetUpsellReview } from "@/components/website/ResetUpsellReview";
import CartItemList from "@/components/website/CartItemList";
import { DiscoveryProducts } from "@/components/website/DiscoveryProducts";
import clsx from "clsx";
import { getCart } from "@/actions/get/cart";
import { getProducts } from "@/actions/get/products";

export default async function Cart() {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";
  const cart = await getCart(deviceIdentifier);

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
    (a, b) => b.index - a.index
  );

  const getExcludedProductIds = (cartItems: CartItemType[]): string[] => {
    const productIds = new Set<string>();

    cartItems.forEach((item: CartItemType) => {
      if (item.type === "product") {
        productIds.add(item.baseProductId);
      } else if (item.type === "upsell" && item.products) {
        item.products.forEach(
          (product: {
            index: number;
            id: string;
            slug: string;
            name: string;
            mainImage: string;
            basePrice: number;
            size: string;
            color: string;
          }) => {
            productIds.add(product.id);
          }
        );
      }
    });

    return Array.from(productIds);
  };

  const excludeIdsFromDiscoveryProducts =
    getExcludedProductIds(sortedCartItems);

  return (
    <>
      <div
        id="scrollable-parent"
        className="pb-32 h-screen overflow-x-hidden overflow-y-auto custom-scrollbar"
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
            {/* <div className="flex items-center gap-[10px] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
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
            </div> */}
          </div>
        </nav>
        <div className="max-w-[968px] mx-auto flex flex-col gap-10">
          <div className="w-full px-5 mx-auto">
            <EmptyCartState sortedCartItems={sortedCartItems} />
            {sortedCartItems?.length > 0 && (
              <CartItemList cartItems={sortedCartItems} />
            )}
          </div>
          <div className="px-5">
            <DiscoveryProducts
              page="CART"
              heading="Add These to Your Cart"
              excludeIds={excludeIdsFromDiscoveryProducts}
              deviceIdentifier={deviceIdentifier}
              cart={cart}
            />
          </div>
        </div>
      </div>
      <ShowAlert />
      <QuickviewOverlay />
      <UpsellReviewOverlay cart={cart} />
      <ResetUpsellReview />
    </>
  );
}

const getBaseProducts = async (productIds: string[]) =>
  getProducts({
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

  const products =
    productIds.length > 0
      ? await getProducts({
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

// -- Compo --
function EmptyCartState({
  sortedCartItems,
}: {
  sortedCartItems: Array<CartItemType>;
}) {
  return (
    <div
      className={clsx(
        sortedCartItems?.length === 0
          ? "flex flex-col items-center py-16 text-lg"
          : "hidden"
      )}
    >
      <Image
        src="/icons/cart-thin.svg"
        alt="Cart"
        width={80}
        height={80}
        priority={true}
      />
    </div>
  );
}

// -- Type Definitions --

type ProductItemType = {
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
};

type UpsellItemType = {
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

type CartItemType = ProductItemType | UpsellItemType;
