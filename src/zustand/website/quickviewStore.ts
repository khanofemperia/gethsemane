import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

type ColorType = {
  name: string;
  image: string;
};

type ProductType = {
  id: string;
  name: string;
  price: string;
  mainImage: string;
  images: string[] | null;
  description: string | null;
  colors: ColorType[] | null;
  sizes: SizeChartType | null;
  slug: string;
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
