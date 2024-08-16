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
    }[];
  };
};

type UpsellReviewStoreType = {
  isVisible: boolean;
  selectedProduct: UpsellReviewProductType | null;
  showOverlay: () => void;
  hideOverlay: () => void;
  setSelectedProduct: (product: UpsellReviewProductType) => void;
};

export const useUpsellReviewStore = createWithEqualityFn<UpsellReviewStoreType>(
  (set) => ({
    isVisible: false,
    selectedProduct: null,
    showOverlay: () => set({ isVisible: true }),
    hideOverlay: () => set({ isVisible: false }),
    setSelectedProduct: (product: UpsellReviewProductType) =>
      set({ selectedProduct: product }),
  }),
  shallow
);
