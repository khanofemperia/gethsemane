import { create } from "zustand";

type OverlayType = {
  pageName: string;
  overlayName: string;
};

type PageOverlayType = {
  [key: string]: {
    name: string;
    isVisible: boolean;
  };
};

type PageType = {
  [key: string]: {
    name: string;
    overlays: PageOverlayType;
  };
};

type OverlayStoreProps = {
  pages: PageType;
  showOverlay: ({ pageName, overlayName }: OverlayType) => void;
  hideOverlay: ({ pageName, overlayName }: OverlayType) => void;
};

export const useOverlayStore = create<OverlayStoreProps>((set) => ({
  pages: {
    productDetails: {
      name: "productDetails",
      overlays: {
        options: {
          name: "options",
          isVisible: false,
        },
        sizeChart: {
          name: "sizeChart",
          isVisible: false,
        },
      },
    },
  },
  showOverlay: ({ pageName, overlayName }: OverlayType) => {
    set((state) => {
      const updatedState: PageType = { ...state.pages };
      const overlay = updatedState[pageName]?.overlays[overlayName];
      if (overlay) {
        overlay.isVisible = true;
      }
      return { pages: updatedState };
    });
  },
  hideOverlay: ({ pageName, overlayName }: OverlayType) => {
    set((state) => {
      const updatedState: PageType = { ...state.pages };
      const overlay = updatedState[pageName]?.overlays[overlayName];
      if (overlay) {
        overlay.isVisible = false;
      }
      return { pages: updatedState };
    });
  },
}));
