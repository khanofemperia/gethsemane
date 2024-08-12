import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

type ProductType = {
  id: string;
  name: string;
  slug: string;
  description: string;
  highlights: {
    headline: string;
    keyPoints: { index: number; text: string }[];
  };
  pricing: {
    salePrice: number;
    basePrice: number;
    discountPercentage: number;
  };
  images: {
    main: string;
    gallery: string[];
  };
  options: {
    colors: Array<{
      name: string;
      image: string;
    }>;
    sizes: {
      inches: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
      centimeters: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
    };
  };
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
  selectedProduct: ProductType | null;
  isInCart: boolean;
  productInCart: ProductInCartType | null;
  showOverlay: () => void;
  hideOverlay: () => void;
  setSelectedProduct: (
    product: ProductType,
    isInCart: boolean,
    productInCart: ProductInCartType | null
  ) => void;
};

export const useQuickviewStore = createWithEqualityFn<QuickviewStoreType>(
  (set) => ({
    isVisible: false,
    selectedProduct: null,
    isInCart: false,
    productInCart: null,
    showOverlay: () => set({ isVisible: true }),
    hideOverlay: () => set({ isVisible: false }),
    setSelectedProduct: (
      product: ProductType,
      isInCart: boolean,
      productInCart: ProductInCartType | null
    ) => set({ selectedProduct: product, isInCart, productInCart }),
  }),
  shallow
);
