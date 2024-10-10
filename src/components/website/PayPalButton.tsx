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
    salePrice: number;
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

  const onApprove = async (data: { orderID: string }) => {
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
      console.log("orderData:", orderData);

      return orderData;
    } catch (error) {
      console.error("Failed to capture order:", error);
      throw error;
    }
  };

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
      item.size && item.size,
      item.color && item.color,
    ].filter(Boolean);

    const attributeString =
      attributes.length > 0 ? `[${attributes.join(", ")}] - ` : "";

    const fullName = `${attributeString}${item.name}`;
    return fullName.length > 127 ? `${fullName.slice(0, 124)}...` : fullName;
  }

  function getPrice(pricing: { salePrice: number; basePrice: number }): number {
    return pricing.salePrice > 0 ? pricing.salePrice : pricing.basePrice;
  }

  return cart.map((item): CartItem => {
    if (item.type === "product") {
      return {
        name: formatProductName(item),
        sku: generateSku(item.baseProductId),
        unit_amount: {
          currency_code: "USD",
          value: getPrice(item.pricing).toFixed(2),
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
          value: getPrice(item.pricing).toFixed(2),
        },
        quantity: 1,
      };
    }
  });
}

const results = {
  id: "9U312611FM462723R",
  status: "COMPLETED",
  payment_source: {
    paypal: {
      email_address: "sb-47bjvq26805577@personal.example.com",
      account_id: "WKWVRRQHHYZ9J",
      account_status: "VERIFIED",
      name: {
        given_name: "John",
        surname: "Doe",
      },
      address: {
        country_code: "ZA",
      },
    },
  },
  purchase_units: [
    {
      reference_id: "default",
      shipping: {
        name: {
          full_name: "John Doe",
        },
        address: {
          address_line_1: "Free Trade Zone",
          admin_area_2: "Johannesburg",
          admin_area_1: "CA",
          postal_code: "2038",
          country_code: "ZA",
        },
      },
      payments: {
        captures: [
          {
            id: "6SY42398DU065104J",
            status: "COMPLETED",
            amount: {
              currency_code: "USD",
              value: "264.97",
            },
            final_capture: true,
            seller_protection: {
              status: "ELIGIBLE",
              dispute_categories: [
                "ITEM_NOT_RECEIVED",
                "UNAUTHORIZED_TRANSACTION",
              ],
            },
            seller_receivable_breakdown: {
              gross_amount: {
                currency_code: "USD",
                value: "264.97",
              },
              paypal_fee: {
                currency_code: "USD",
                value: "9.31",
              },
              net_amount: {
                currency_code: "USD",
                value: "255.66",
              },
            },
            links: [
              {
                href: "https://api.sandbox.paypal.com/v2/payments/captures/6SY42398DU065104J",
                rel: "self",
                method: "GET",
              },
              {
                href: "https://api.sandbox.paypal.com/v2/payments/captures/6SY42398DU065104J/refund",
                rel: "refund",
                method: "POST",
              },
              {
                href: "https://api.sandbox.paypal.com/v2/checkout/orders/9U312611FM462723R",
                rel: "up",
                method: "GET",
              },
            ],
            create_time: "2024-10-10T05:41:50Z",
            update_time: "2024-10-10T05:41:50Z",
          },
        ],
      },
    },
  ],
  payer: {
    name: {
      given_name: "John",
      surname: "Doe",
    },
    email_address: "sb-47bjvq26805577@personal.example.com",
    payer_id: "WKWVRRQHHYZ9J",
    address: {
      country_code: "ZA",
    },
  },
  links: [
    {
      href: "https://api.sandbox.paypal.com/v2/checkout/orders/9U312611FM462723R",
      rel: "self",
      method: "GET",
    },
  ],
};
