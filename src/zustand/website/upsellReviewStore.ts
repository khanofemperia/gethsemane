import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

type UpsellReviewProductType = {
  id: string;
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

type UpsellReviewStoreType = {
  isVisible: boolean;
  selectedProduct: UpsellReviewProductType | null;
  selectedOptions: { [key: string]: { color?: string; size?: string } };
  readyProducts: string[];
  showOverlay: () => void;
  hideOverlay: () => void;
  setSelectedProduct: (product: UpsellReviewProductType) => void;
  setSelectedOptions: (options: {
    [key: string]: { color?: string; size?: string };
  }) => void;
  setReadyProducts: (products: string[]) => void;
};

export const useUpsellReviewStore = createWithEqualityFn<UpsellReviewStoreType>(
  (set) => ({
    isVisible: false,
    selectedProduct: null,
    selectedOptions: {},
    readyProducts: [],
    showOverlay: () => set({ isVisible: true }),
    hideOverlay: () =>
      set({
        isVisible: false,
        selectedOptions: {},
        readyProducts: [],
      }),
    setSelectedProduct: (product: UpsellReviewProductType) =>
      set({ selectedProduct: product }),
    setSelectedOptions: (options) => set({ selectedOptions: options }),
    setReadyProducts: (products) => set({ readyProducts: products }),
  }),
  shallow
);
