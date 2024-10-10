import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { setDoc, doc } from "firebase/firestore";
import { database } from "@/lib/firebase";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.NEXT_PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

export async function POST(
  request: NextRequest,
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
