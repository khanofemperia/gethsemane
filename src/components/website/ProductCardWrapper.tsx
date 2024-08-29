import { ProductCard } from "./ProductCard";

type ProductWithUpsellType = Omit<ProductType, "upsell"> & {
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      salePrice: number;
      basePrice: number;
      discountPercentage: number;
    };
    visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
    createdAt: string;
    updatedAt: string;
    products: {
      id: string;
      name: string;
      slug: string;
      mainImage: string;
      basePrice: number;
      options: {
        colors: Array<{
          name: string;
          image: string;
        }>;
        sizes: {
          inches: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
          centimeters: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
        };
      };
    }[];
  };
};

type CartType = {
  id: string;
  device_identifier: string;
  products: Array<{
    id: string;
    size: string;
    color: string;
  }>;
};

export async function ProductCardWrapper({
  product,
  cart,
}: {
  product: ProductWithUpsellType;
  cart: CartType;
}) {
  const productsInCart =
    cart?.products.filter(
      (item: { id: string; color: string; size: string }) =>
        item.id === product.id
    ) || [];

  const inCart = productsInCart.length > 0;
  const cartProducts = productsInCart;

  return (
    <ProductCard
      product={product}
      inCart={inCart}
      cartProducts={cartProducts}
    />
  );
}
