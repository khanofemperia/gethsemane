import { create } from "zustand";

type ScrollStoreProps = {
  scrollPosition: number;
  shouldShowBar: boolean;
  setScrollPosition: (position: number) => void;
  setShouldShowBar: (show: boolean) => void;
};

export const useScrollStore = create<ScrollStoreProps>((set) => ({
  scrollPosition: 0,
  shouldShowBar: false,
  setScrollPosition: (position) => set({ scrollPosition: position }),
  setShouldShowBar: (show) => set({ shouldShowBar: show }),
}));