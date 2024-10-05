"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

type CartItem = {
  name: string;
  sku: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  quantity: number;
};

type UpsellCartItem = {
  baseUpsellId: string;
  type: "upsell";
  pricing: {
    basePrice: number;
  };
  products: Array<{
    id: string;
    name: string;
    basePrice: number;
    size: string;
    color: string;
  }>;
};

type ProductCartItem = {
  baseProductId: string;
  name: string;
  type: "product";
  pricing: {
    basePrice: number;
    salePrice: number;
  };
  size?: string;
  color?: string;
};

type Cart = (ProductCartItem | UpsellCartItem)[];

const initialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  currency: "USD",
  intent: "capture",
};

export function PayPalButton({ cart }: { cart: any }) {
  if (!initialOptions.clientId) {
    console.error("PayPal Client ID is not set");
    return null;
  }

  const cartItems = generateCartItems(cart);

  const createOrder = async () => {
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart: cartItems }),
      });

      const orderData = await response.json();
      return orderData.id;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      const response = await fetch(
        `/api/paypal/capture-order/${data.orderID}`,
        {
          method: "POST",
        }
      );

      const orderData = await response.json();
      console.log("Payment captured:", orderData);
    } catch (error) {
      console.error("Failed to capture order:", error);
      throw error;
    }
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{
          shape: "pill",
          layout: "horizontal",
          color: "gold",
          label: "pay",
        }}
        createOrder={createOrder}
        onApprove={onApprove}
      />
    </PayPalScriptProvider>
  );
}

function generateCartItems(cart: Cart): CartItem[] {
  const skuCounters: Record<string, number> = {};
  const cartItems: CartItem[] = [];

  function generateSku(baseId: string): string {
    if (!skuCounters[baseId]) {
      skuCounters[baseId] = 1;
    } else {
      skuCounters[baseId]++;
    }
    return `${baseId}-${String(skuCounters[baseId]).padStart(2, "0")}`;
  }

  function formatProductName(item: ProductCartItem): string {
    const attributes = [];
    if (item.size) attributes.push(`Size: ${item.size}`);
    if (item.color) attributes.push(`Color: ${item.color}`);

    const attributeString =
      attributes.length > 0 ? `[${attributes.join(", ")}] - ` : "";

    const fullName = `${attributeString}${item.name}`;
    return fullName.length > 127 ? `${fullName.slice(0, 124)}...` : fullName;
  }

  cart.forEach((item) => {
    if (item.type === "product") {
      const productItem = item as ProductCartItem;
      cartItems.push({
        name: formatProductName(productItem),
        sku: generateSku(productItem.baseProductId),
        unit_amount: {
          currency_code: "USD",
          value: productItem.pricing.salePrice.toFixed(2),
        },
        quantity: 1,
      });
    } else if (item.type === "upsell") {
      const upsellItem = item as UpsellCartItem;

      const productDetails = upsellItem.products
        .map((product) => {
          const details = [product.id];
          if (product.size) details.push(product.size);
          if (product.color) details.push(product.color);
          return `[${details.join(", ")}]`;
        })
        .join(" + ");

      cartItems.push({
        name:
          productDetails.length > 127
            ? `${productDetails.slice(0, 124)}...`
            : productDetails,
        sku: generateSku(upsellItem.baseUpsellId),
        unit_amount: {
          currency_code: "USD",
          value: upsellItem.pricing.basePrice.toFixed(2),
        },
        quantity: 1,
      });
    }
  });

  return cartItems;
}
