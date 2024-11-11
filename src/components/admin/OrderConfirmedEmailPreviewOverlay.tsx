"use client";

import AlertMessage from "@/components/shared/AlertMessage";
import { useState, useEffect } from "react";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  CloseIconThin,
} from "@/icons";
import Overlay from "@/ui/Overlay";
import { AlertMessageType } from "@/lib/sharedTypes";
import { OrderConfirmation } from "../emails/OrderConfirmation";
import clsx from "clsx";
import { Spinner } from "@/ui/Spinners/Default";

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
  const [loading, setLoading] = useState(false);
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
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white md:w-[556px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">New product</h2>
                  <button
                    onClick={() => hideOverlay({ pageName, overlayName })}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={() => hideOverlay({ pageName, overlayName })}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                >
                  <ArrowLeftIcon className="fill-blue -ml-[2px]" size={20} />
                  <span className="font-semibold text-sm text-blue">
                    New product
                  </span>
                </button>
                <button
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "hover:bg-neutral-700/85 active:bg-neutral-700/85": !loading,
                    }
                  )}
                >
                  {loading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner color="white" />
                      <span className="text-white">Sending</span>
                    </div>
                  ) : (
                    <span className="text-white">Email the Customer</span>
                  )}
                </button>
              </div>
              <div className="w-full h-full mt-[52px] md:mt-0 pt-5 pb-28 md:pb-10 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <OrderConfirmation />
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0">
              <button
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loading,
                    "active:bg-neutral-700/85": !loading,
                  }
                )}
              >
                {loading ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner color="white" />
                    <span className="text-white">Saving</span>
                  </div>
                ) : (
                  <span className="text-white">Save</span>
                )}
              </button>
            </div>
          </div>
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
