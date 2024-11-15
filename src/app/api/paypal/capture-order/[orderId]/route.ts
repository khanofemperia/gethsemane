import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { setDoc, doc } from "firebase/firestore";
import { database } from "@/lib/firebase";
import { cookies } from "next/headers";
import { getDoc } from "firebase/firestore";
import { getCart } from "@/lib/api/cart";
import { getProducts } from "@/lib/api/products";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.NEXT_PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

export async function POST(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  if (!orderId) {
    return NextResponse.json(
      { error: "Order ID is required" },
      { status: 400 }
    );
  }

  try {
    const accessToken = await generateAccessToken();
    const url = `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to capture order: ${errorData.message}`);
    }

    const orderData = await response.json();
    const cartItems = await getCartItems();

    const newOrder = {
      status: orderData.status,
      payer: {
        email: orderData.payer.email_address,
        payerId: orderData.payer.payer_id,
        name: {
          firstName: orderData.payer.name.given_name,
          lastName: orderData.payer.name.surname,
        },
      },
      amount: {
        value: orderData.purchase_units[0].payments.captures[0].amount.value,
        currency:
          orderData.purchase_units[0].payments.captures[0].amount.currency_code,
      },
      shipping: {
        name: orderData.purchase_units[0].shipping.name.full_name,
        address: {
          line1: orderData.purchase_units[0].shipping.address.address_line_1,
          city: orderData.purchase_units[0].shipping.address.admin_area_2,
          state: orderData.purchase_units[0].shipping.address.admin_area_1,
          postalCode: orderData.purchase_units[0].shipping.address.postal_code,
          country: orderData.purchase_units[0].shipping.address.country_code,
        },
      },
      transactionId: orderData.purchase_units[0].payments.captures[0].id,
      timestamp: orderData.purchase_units[0].payments.captures[0].create_time,
      items: cartItems,
      emails: {
        confirmed: {
          sentCount: 0,
          maxAllowed: 2,
          lastSent: null,
        },
        shipped: {
          sentCount: 0,
          maxAllowed: 2,
          lastSent: null,
        },
        delivered: {
          sentCount: 0,
          maxAllowed: 2,
          lastSent: null,
        },
      },
    };

    const orderRef = doc(database, "orders", orderData.id);
    await setDoc(orderRef, newOrder);

    return NextResponse.json({
      message: "Order captured and saved successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error capturing and saving order:", error);
    return NextResponse.json(
      { error: "An error occurred while capturing and saving the order." },
      { status: 500 }
    );
  }
}

async function generateAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials are missing");
  }

  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
}

async function getCartItems() {
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

  return sortedCartItems;
}

const getBaseProducts = async (productIds: string[]) =>
  getProducts({
    ids: productIds,
    fields: ["name", "slug", "pricing", "images", "options"],
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
