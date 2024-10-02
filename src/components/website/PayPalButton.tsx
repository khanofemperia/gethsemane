"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const initialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  currency: "USD",
  intent: "capture",
};

export function PayPalButton({ cart }: { cart: CartType | null }) {
  if (!initialOptions.clientId) {
    console.error("PayPal Client ID is not set");
    return null;
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{
          shape: "pill",
          layout: "horizontal",
          color: "gold",
          label: "pay",
        }}
      />
    </PayPalScriptProvider>
  );
}
