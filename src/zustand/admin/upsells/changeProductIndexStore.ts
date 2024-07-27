import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

type SelectedProductType = {
  id: string;
  name?: string;
  index?: string;
  upsellId: string;
};

type ProductStoreType = {
  selectedProduct: SelectedProductType;
  setSelectedProduct: (product: SelectedProductType) => void;
};

export const useChangeProductIndexStore =
  createWithEqualityFn<ProductStoreType>(
    (set) => ({
      selectedProduct: {
        id: "",
        index: "",
        name: "",
        upsellId: "",
      },
      setSelectedProduct: (product) => {
        set({ selectedProduct: product });
      },
    }),
    shallow
  );
