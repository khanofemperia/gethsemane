"use client";

import { useAlertStore } from "@/zustand/website/alertStore";
import AlertMessage from "../shared/AlertMessage";

export default function ShowAlert() {
  const message = useAlertStore(state => state.message);
  const type = useAlertStore(state => state.type);
  const isVisible = useAlertStore(state => state.isVisible);
  const hideAlert = useAlertStore(state => state.hideAlert);

  return (
    <>
      {isVisible && (
        <AlertMessage
          hideAlertMessage={hideAlert}
          message={message}
          type={type}
        />
      )}
    </>
  );
}
