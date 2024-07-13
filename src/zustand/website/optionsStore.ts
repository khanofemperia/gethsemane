import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

type OptionsStoreType = {
  selectedColor: string;
  selectedSize: string;
  setSelectedColor: (color: string) => void;
  setSelectedSize: (size: string) => void;
};

export const useOptionsStore = createWithEqualityFn<OptionsStoreType>(
  (set) => ({
    selectedColor: "",
    selectedSize: "",
    setSelectedColor: (color) => set({ selectedColor: color }),
    setSelectedSize: (size) => set({ selectedSize: size }),
  }),
  shallow
);
