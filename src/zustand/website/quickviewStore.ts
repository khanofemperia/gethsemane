import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

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

type ProductInCartType = {
  id: string;
  color: string;
  size: string;
};

type QuickviewStoreType = {
  isVisible: boolean;
  selectedProduct: ProductWithUpsellType | null;
  inCart: boolean;
  cartProducts: Array<{
    id: string;
    color: string;
    size: string;
  }>;
  showOverlay: () => void;
  hideOverlay: () => void;
  setSelectedProduct: (
    product: ProductWithUpsellType,
    inCart: boolean,
    cartProducts: Array<{
      id: string;
      color: string;
      size: string;
    }>
  ) => void;
};

export const useQuickviewStore = createWithEqualityFn<QuickviewStoreType>(
  (set) => ({
    isVisible: false,
    selectedProduct: null,
    inCart: false,
    cartProducts: [],
    showOverlay: () => set({ isVisible: true }),
    hideOverlay: () => set({ isVisible: false }),
    setSelectedProduct: (
      product: ProductWithUpsellType,
      inCart: boolean,
      cartProducts: Array<{
        id: string;
        color: string;
        size: string;
      }>
    ) => set({ selectedProduct: product, inCart, cartProducts }),
  }),
  shallow
);
