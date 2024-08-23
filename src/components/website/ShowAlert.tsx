"use client";

import { useAlertStore } from "@/zustand/website/alertStore";
import { useEffect } from "react";
import AlertMessage from "../shared/AlertMessage";

export default function ShowAlert() {
  const { hideAlert } = useAlertStore();

  const { message, isVisible } = useAlertStore((state) => ({
    message: state.alertMessage,
    isVisible: state.isVisible,
  }));

  return (
    <>
      {isVisible && (
        <AlertMessage message={message} hideAlertMessage={hideAlert} />
      )}
    </>
  );
}
