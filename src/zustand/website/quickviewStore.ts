import { create } from "zustand";

type QuickviewStoreType = {
  isVisible: boolean;
  selectedProduct: ProductWithUpsellType | null;
  cart: CartType | null;
  deviceIdentifier: string;
  showOverlay: () => void;
  hideOverlay: () => void;
  setSelectedProduct: (
    product: ProductWithUpsellType,
    cart: CartType | null,
    deviceIdentifier: string
  ) => void;
};

export const useQuickviewStore = create<QuickviewStoreType>(
  (set) => ({
    isVisible: false,
    selectedProduct: null,
    cart: null,
    deviceIdentifier: "",
    showOverlay: () => set({ isVisible: true }),
    hideOverlay: () => set({ isVisible: false }),
    setSelectedProduct: (
      product: ProductWithUpsellType,
      cart: CartType | null,
      deviceIdentifier: string
    ) =>
      set({
        selectedProduct: product,
        cart,
        deviceIdentifier,
      }),
  })
);
