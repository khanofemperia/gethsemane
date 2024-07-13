import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

type SelectedProductType = {
  id: string;
  name?: string;
  index?: string;
  collectionId: string;
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
        collectionId: "",
      },
      setSelectedProduct: (product) => {
        set({ selectedProduct: product });
      },
    }),
    shallow
  );
