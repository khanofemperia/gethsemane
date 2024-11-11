"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import AlertMessage from "@/components/shared/AlertMessage";
import Overlay from "@/ui/Overlay";
import { AlertMessageType, EmailType } from "@/lib/sharedTypes";
import { OrderConfirmation } from "../emails/OrderConfirmation";
import { Spinner } from "@/ui/Spinners/Default";
import { ArrowLeftIcon, ChevronRightIcon } from "@/icons";

export function OrderConfirmedEmailPreviewButton() {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.orderDetails.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.orderDetails.overlays.emailPreview.name
  );

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className="w-[310px] py-3 px-4 border cursor-pointer rounded-lg flex justify-center gap-2 transition ease-in-out duration-300 hover:bg-lightgray"
    >
      <div>
        <h2 className="font-semibold text-sm mb-1 flex items-center gap-[2px] w-max mx-auto">
          <span>Confirmed</span>
          <ChevronRightIcon size={16} className="text-gray" />
        </h2>
        <span className="text-xs text-green">1 of 2 attempts used</span>{" "}
        <span className="text-xs text-gray">• Last sent Nov 3, 2024</span>
      </div>
    </button>
  );
}

export function OrderConfirmedEmailPreviewOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    message: "",
    isVisible: false,
    type: AlertMessageType.NEUTRAL,
  });

  const { hideOverlay, isOverlayVisible } = useOverlayStore((state) => ({
    hideOverlay: state.hideOverlay,
    isOverlayVisible: state.pages.orderDetails.overlays.emailPreview.isVisible,
  }));
  const pageName = useOverlayStore((state) => state.pages.orderDetails.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.orderDetails.overlays.emailPreview.name
  );

  const closeAlert = () =>
    setAlert({ ...alert, isVisible: false, message: "" });

  useEffect(() => {
    document.body.style.overflow =
      isOverlayVisible || alert.isVisible ? "hidden" : "visible";
    return () => {
      if (!isOverlayVisible && !alert.isVisible) {
        document.body.style.overflow = "visible";
      }
    };
  }, [isOverlayVisible, alert.isVisible]);

  async function handleSendEmail(type: string) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/order-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: "recipient@example.com",
          emailSubject: "Order Notification",
          emailType: type,
        }),
      });

      const data = await response.json();
      console.log(data);
      setAlert({
        message: "Email sent successfully!",
        isVisible: true,
        type: AlertMessageType.SUCCESS,
      });
    } catch (error) {
      console.error(error);
      setAlert({
        message: "Failed to send email",
        isVisible: true,
        type: AlertMessageType.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl bg-white md:w-[556px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative">
            <div className="flex items-center justify-between px-4 py-2 md:py-2 md:pr-4 md:pl-2">
              <button
                onClick={() => hideOverlay({ pageName, overlayName })}
                type="button"
                className="h-9 px-3 rounded-full flex items-center gap-1 transition ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
              >
                <ArrowLeftIcon size={20} className="fill-blue" />
                <span className="font-semibold text-sm text-blue">
                  Order confirmed
                </span>
              </button>
              <button
                onClick={() => handleSendEmail(EmailType.ORDER_CONFIRMED)}
                disabled={isLoading}
                className={clsx(
                  "relative h-9 w-max px-4 rounded-full text-white bg-neutral-700 transition ease-in-out",
                  {
                    "bg-opacity-50": isLoading,
                    "hover:bg-neutral-700/85 active:bg-neutral-700/85":
                      !isLoading,
                  }
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-1 justify-center w-full h-full">
                    <Spinner color="white" />
                    <span className="text-white">Sending</span>
                  </div>
                ) : (
                  <span className="text-white">Email the Customer</span>
                )}
              </button>
            </div>
            <div className="p-5">
              <div className="border border-dashed rounded-md overflow-hidden">
                <OrderConfirmation />
              </div>
            </div>
            <div className="w-full pb-5 pt-2 px-5 md:hidden">
              <button
                disabled={isLoading}
                className={clsx(
                  "relative h-12 w-full rounded-full text-white bg-neutral-700 transition ease-in-out",
                  {
                    "bg-opacity-50": isLoading,
                    "active:bg-neutral-700/85": !isLoading,
                  }
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-1 justify-center w-full h-full">
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
      {alert.isVisible && (
        <AlertMessage
          message={alert.message}
          hideAlertMessage={closeAlert}
          type={alert.type}
        />
      )}
    </>
  );
}
