"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useEffect, useState, useCallback } from "react";

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
} as const;

export function PayPalButton({ cart }: { cart: Cart }) {
  const [key, setKey] = useState(() => cart.length);

  useEffect(() => {
    setKey(cart.length);
  }, [cart]);

  const cartItems = generateCartItems(cart);

  const createOrder = useCallback(async () => {
    console.log(cartItems);

    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart: cartItems }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const orderData = await response.json();
      return orderData.id;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  }, [cartItems]);

  const onApprove = useCallback(async (data: { orderID: string }) => {
    try {
      const response = await fetch(
        `/api/paypal/capture-order/${data.orderID}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const orderData = await response.json();
      console.log("Payment captured:", orderData);
      return orderData;
    } catch (error) {
      console.error("Failed to capture order:", error);
      throw error;
    }
  }, []);

  if (!initialOptions.clientId) {
    console.error("PayPal Client ID is not set");
    return null;
  }

  return (
    <PayPalScriptProvider key={key} options={initialOptions}>
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

  function generateSku(baseId: string): string {
    skuCounters[baseId] = (skuCounters[baseId] || 0) + 1;
    return `${baseId}-${String(skuCounters[baseId]).padStart(2, "0")}`;
  }

  function formatProductName(item: ProductCartItem): string {
    const attributes = [
      item.size && `${item.size}`,
      item.color && `${item.color}`,
    ].filter(Boolean);

    const attributeString =
      attributes.length > 0 ? `[${attributes.join(", ")}] - ` : "";

    const fullName = `${attributeString}${item.name}`;
    return fullName.length > 127 ? `${fullName.slice(0, 124)}...` : fullName;
  }

  return cart.map((item): CartItem => {
    if (item.type === "product") {
      return {
        name: formatProductName(item),
        sku: generateSku(item.baseProductId),
        unit_amount: {
          currency_code: "USD",
          value: item.pricing.salePrice.toFixed(2),
        },
        quantity: 1,
      };
    } else {
      const productDetails = item.products
        .map((product) => {
          const details = [product.id, product.size, product.color].filter(
            Boolean
          );
          return `[${details.join(", ")}]`;
        })
        .join(" + ");

      return {
        name:
          productDetails.length > 127
            ? `${productDetails.slice(0, 124)}...`
            : productDetails,
        sku: generateSku(item.baseUpsellId),
        unit_amount: {
          currency_code: "USD",
          value: item.pricing.basePrice.toFixed(2),
        },
        quantity: 1,
      };
    }
  });
}
