"use client";

import AlertMessage from "@/components/shared/AlertMessage";
import { FormEvent, useState, useEffect, useRef, ChangeEvent } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
} from "@/icons";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { UpdateProductAction } from "@/actions/products";
import { AlertMessageType } from "@/lib/sharedTypes";
import { getCategories } from "@/lib/api/categories";

export function OrderConfirmedEmailPreviewButton() {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.orderDetails.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.orderDetails.overlays.orderConfirmedEmailPreview.name
  );

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className="w-[310px] py-3 px-4 border cursor-pointer rounded-lg flex justify-center gap-2 ease-in-out duration-300 transition hover:bg-lightgray"
    >
      <div>
        <h2 className="font-semibold text-sm mb-1 flex items-center gap-[2px] w-max mx-auto">
          <span>Confirmed</span>
          <ChevronRightIcon size={16} className="text-gray" />
        </h2>
        <div>
          <span className="text-xs text-green">1 of 2 attempts used</span>{" "}
          <span className="text-xs text-gray">• Last sent Nov 3, 2024</span>
        </div>
      </div>
    </button>
  );
}

export function OrderConfirmedEmailPreviewOverlay() {
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );

  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.orderDetails.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.orderDetails.overlays.orderConfirmedEmailPreview.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) =>
      state.pages.orderDetails.overlays.orderConfirmedEmailPreview.isVisible
  );

  useEffect(() => {
    if (isOverlayVisible || showAlert) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      if (!isOverlayVisible && !showAlert) {
        document.body.style.overflow = "visible";
      }
    };
  }, [isOverlayVisible, showAlert]);

  const hideAlertMessage = () => {
    setShowAlert(false);
    setAlertMessage("");
    setAlertMessageType(AlertMessageType.NEUTRAL);
  };

  async function handleSendOrderEmail() {
    const response = await fetch("/api/order-emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "recipient@example.com",
        subject: "Order Notification",
        text: "Your order has been placed.",
        html: "<h1>Order Notification</h1><p>Your order has been placed.</p>",
      }),
    });

    const data = await response.json();
    console.log(data);
  }

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0"></div>
        </Overlay>
      )}
      {showAlert && (
        <AlertMessage
          message={alertMessage}
          hideAlertMessage={hideAlertMessage}
          type={alertMessageType}
        />
      )}
    </>
  );
}
