"use client";

import { useAlertStore } from "@/zustand/website/alertStore";
import AlertMessage from "../shared/AlertMessage";

export default function ShowAlert() {
  const { message, type, isVisible, hideAlert } = useAlertStore();

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
