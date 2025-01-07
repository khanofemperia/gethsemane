import { create } from "zustand";

type ScrollStoreProps = {
  productInfoWrapperHeight: number;
  scrollPosition: number;
  shouldShowBar: boolean;
  setProductInfoWrapperHeight: (height: number) => void;
  setScrollPosition: (position: number) => void;
  setShouldShowBar: (show: boolean) => void;
};

export const useScrollStore = create<ScrollStoreProps>((set) => ({
  productInfoWrapperHeight: 0,
  scrollPosition: 0,
  shouldShowBar: false,

  setProductInfoWrapperHeight: (height) =>
    set({ productInfoWrapperHeight: height }),

  setScrollPosition: (position) => set({ scrollPosition: position }),

  setShouldShowBar: (show) => set({ shouldShowBar: show }),
}));
