import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const initialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  currency: "USD",
  intent: "capture",
};

export function PayPalButton({ cart }) {
  if (!initialOptions.clientId) {
    console.error("PayPal Client ID is not set");
    return null;
  }

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      const price = item.pricing.salePrice || item.pricing.basePrice;
      return sum + Number(price);
    }, 0);
    
    // Round down to the nearest .99
    return total === 0 ? 0 : Math.floor(total) + 0.99;
  };

  const createOrder = async () => {
    try {
      const total = calculateTotal(cart.items);
      
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: {
            ...cart,
            total,
          },
        }),
      });
      
      const orderData = await response.json();
      return orderData.id;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  };

  const onApprove = async (data) => {
    try {
      const response = await fetch(`/api/paypal/capture-order/${data.orderID}`, {
        method: 'POST',
      });
      
      const orderData = await response.json();
      // Handle successful payment here
      console.log('Payment captured:', orderData);
    } catch (error) {
      console.error('Failed to capture order:', error);
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