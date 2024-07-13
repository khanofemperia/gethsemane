import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

type NavbarMenuStoreType = {
  navbarMenuVisible: boolean;
  setNavbarMenu: (visible: boolean) => void;
};

export const useNavbarMenuStore = createWithEqualityFn<NavbarMenuStoreType>(
  (set) => ({
    navbarMenuVisible: false,
    setNavbarMenu: (visible) => set({ navbarMenuVisible: visible }),
  }),
  shallow
);
