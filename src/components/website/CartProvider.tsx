import { getCart } from "@/lib/getData";
import { cookies } from "next/headers";
import React from "react";

type CartProductItemType = {
  index: number;
  baseProductId: string;
  variantId: string;
  color: string;
  size: string;
  type: "product";
};

type CartUpsellItemType = {
  index: number;
  baseUpsellId: string;
  variantId: string;
  type: "upsell";
  products: Array<{
    id: string;
    color: string;
    size: string;
  }>;
};

type CartType = {
  id: string;
  device_identifier: string;
  items: Array<CartProductItemType | CartUpsellItemType>;
};

export async function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;
  const cart = await getCart(deviceIdentifier);

  const childrenWithCart = React.Children.map(children, (child) => {
    if (React.isValidElement<{ cart?: CartType | null }>(child)) {
      return React.cloneElement(child, { cart });
    }
    return child;
  });

  return <>{childrenWithCart}</>;
}

// Usage example
const CartContents: React.FC<{ cart?: CartType | null }> = ({ cart }) => {
  if (!cart) return <div>Loading cart...</div>;

  return (
    <div>
      <h2>Cart Contents</h2>
      {cart.items.map((item, index) => (
        <div key={index}>
          {item.type === "product" ? (
            <div>
              Product: {item.baseProductId} - Color: {item.color}, Size:{" "}
              {item.size}
            </div>
          ) : (
            <div>
              Upsell: {item.baseUpsellId}
              <ul>
                {item.products.map((product, pIndex) => (
                  <li key={pIndex}>
                    ID: {product.id}, Color: {product.color}, Size:{" "}
                    {product.size}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// In your page component
export default function CartPage() {
  return (
    <CartProvider>
      <CartContents />
    </CartProvider>
  );
}
