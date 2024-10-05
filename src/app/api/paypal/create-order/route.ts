import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.NEXT_PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

type CartItem = {
  name: string;
  sku: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  quantity: number;
};

export async function POST(request: NextRequest) {
  try {
    const { cart } = await request.json();

    if (!cart || !Array.isArray(cart)) {
      return NextResponse.json({ error: "Invalid cart data" }, { status: 400 });
    }

    const totalAmount = calculateTotalAmount(cart);
    const accessToken = await generateAccessToken();
    const url = `${PAYPAL_API_BASE}/v2/checkout/orders`;

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalAmount,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: totalAmount,
              },
            },
          },
          items: cart,
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("PayPal API error:", errorData);
      throw new Error("Failed to create PayPal order");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to create PayPal order:", error);
    return NextResponse.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}

function calculateTotalAmount(cart: CartItem[]): string {
  const total = cart.reduce((sum, item) => {
    return sum + parseFloat(item.unit_amount.value) * item.quantity;
  }, 0);

  return total.toFixed(2);
}

async function generateAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("Missing PayPal credentials");
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
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
}
