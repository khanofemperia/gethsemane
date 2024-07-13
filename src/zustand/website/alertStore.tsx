import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

type AlertStoreType = {
  isVisible: boolean;
  alertMessage: string;
  showAlert: (message: string) => void;
  hideAlert: () => void;
};

export const useAlertStore = createWithEqualityFn<AlertStoreType>(
  (set) => ({
    isVisible: false,
    alertMessage: "",
    showAlert: (message) => set({ isVisible: true, alertMessage: message }),
    hideAlert: () => set({ isVisible: false, alertMessage: "" }),
  }),
  shallow
);
