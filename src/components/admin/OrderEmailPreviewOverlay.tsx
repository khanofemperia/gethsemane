"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import AlertMessage from "@/components/shared/AlertMessage";
import Overlay from "@/ui/Overlay";
import { AlertMessageType, EmailType } from "@/lib/sharedTypes";
import { OrderConfirmedTemplate } from "./emails/OrderConfirmedTemplate";
import { OrderShippedTemplate } from "./emails/OrderShippedTemplate";
import { OrderDeliveredTemplate } from "./emails/OrderDeliveredTemplate";
import { Spinner } from "@/ui/Spinners/Default";
import { ArrowLeftIcon, ChevronRightIcon } from "@/icons";

const overlayNameKeys: Record<EmailType, string> = {
  [EmailType.ORDER_CONFIRMED]: "orderConfirmedEmailPreview",
  [EmailType.ORDER_SHIPPED]: "orderShippedEmailPreview",
  [EmailType.ORDER_DELIVERED]: "orderDeliveredEmailPreview",
};

const emailLabels: Record<EmailType, string> = {
  [EmailType.ORDER_CONFIRMED]: "Confirmed",
  [EmailType.ORDER_SHIPPED]: "Shipped",
  [EmailType.ORDER_DELIVERED]: "Delivered",
};

const emailSubjects: Record<EmailType, string> = {
  [EmailType.ORDER_CONFIRMED]: "Your Order's Confirmed",
  [EmailType.ORDER_SHIPPED]: "Your Order Has Been Shipped",
  [EmailType.ORDER_DELIVERED]: "Your Order Has Been Delivered",
};

const overlayTitles: Record<EmailType, string> = {
  [EmailType.ORDER_CONFIRMED]: "Order confirmed",
  [EmailType.ORDER_SHIPPED]: "Order shipped",
  [EmailType.ORDER_DELIVERED]: "Order delivered",
};

export function EmailPreviewButton({
  emailType,
  email,
}: {
  emailType: EmailType;
  email: {
    sentCount: number;
    maxAllowed: number;
    lastSent: string | null;
  };
}) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.orderDetails.name);
  const overlayName = useOverlayStore(
    (state) =>
      state.pages.orderDetails.overlays[overlayNameKeys[emailType]].name
  );

  const getLastSentText = () => {
    if (!email.lastSent || email.sentCount === 0) {
      // Optional: Log a warning if there's inconsistency
      if (email.lastSent && email.sentCount === 0) {
        console.warn(
          `Inconsistent data: lastSent is set but sentCount is 0 for emailType ${emailType}`
        );
      }
      return null;
    }
    return `Last sent ${new Date(email.lastSent).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  const getRemainingSendsText = () => {
    const remainingSends = email.maxAllowed - email.sentCount;
    if (remainingSends <= 0) return "Max sends reached";
    return `${remainingSends} send${remainingSends > 1 ? "s" : ""} remaining`;
  };

  const remainingSends = email.maxAllowed - email.sentCount;
  const isMaxReached = remainingSends <= 0;

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className="w-[310px] py-3 px-4 border cursor-pointer rounded-lg flex justify-center gap-2 transition ease-in-out duration-300 hover:bg-lightgray"
    >
      <div>
        <h2 className="font-semibold text-sm mb-1 flex items-center gap-[2px] w-max mx-auto">
          <span>{emailLabels[emailType]}</span>
          <ChevronRightIcon size={16} className="text-gray" />
        </h2>
        {email.sentCount === 0 ? (
          <span className="text-xs text-gray">Not sent yet</span>
        ) : email.lastSent ? (
          <span className="text-xs text-green">{getLastSentText()}</span>
        ) : (
          <span className="text-xs text-gray">Not sent yet</span>
        )}
        <span className="text-xs text-gray">
          •{" "}
          {isMaxReached ? (
            <span className="text-red">Max sends reached</span>
          ) : email.sentCount === 0 ? (
            `${remainingSends} send${remainingSends > 1 ? "s" : ""} remaining`
          ) : (
            getRemainingSendsText()
          )}
        </span>
      </div>
    </button>
  );
}

export function EmailPreviewOverlay({
  emailType,
  email,
  orderId,
}: {
  emailType: EmailType;
  email: {
    sentCount: number;
    maxAllowed: number;
    lastSent: string | null;
  };
  orderId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    message: "",
    isVisible: false,
    type: AlertMessageType.NEUTRAL,
  });

  const overlayStore = useOverlayStore((state) => state);
  const hideOverlay = overlayStore.hideOverlay;
  const isOverlayVisible =
    overlayStore.pages.orderDetails.overlays[overlayNameKeys[emailType]]
      .isVisible;
  const pageName = overlayStore.pages.orderDetails.name;
  const overlayName =
    overlayStore.pages.orderDetails.overlays[overlayNameKeys[emailType]].name;

  useEffect(() => {
    document.body.style.overflow =
      isOverlayVisible || alert.isVisible ? "hidden" : "visible";
    return () => {
      if (!isOverlayVisible && !alert.isVisible) {
        document.body.style.overflow = "visible";
      }
    };
  }, [isOverlayVisible, alert.isVisible]);

  const closeAlert = () =>
    setAlert({ ...alert, isVisible: false, message: "" });

  async function handleSendEmail() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/order-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: "khanofemperia@gmail.com",
          emailSubject: emailSubjects[emailType],
          emailType: emailType,
          orderId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send email");

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

  const renderEmailTemplate = () => {
    switch (emailType) {
      case EmailType.ORDER_CONFIRMED:
        return <OrderConfirmedTemplate />;
      case EmailType.ORDER_SHIPPED:
        return <OrderShippedTemplate />;
      case EmailType.ORDER_DELIVERED:
        return <OrderDeliveredTemplate />;
      default:
        return null;
    }
  };

  const renderSendButton = (isMobile = false) => {
    const getLastSentText = () => {
      if (!email.lastSent || email.sentCount === 0) {
        // Optional: Log warning for inconsistent data
        if (email.lastSent && email.sentCount === 0) {
          console.warn(
            `Inconsistent data: lastSent is set but sentCount is 0 for this email.`
          );
        }
        return null;
      }
      return `Last sent ${new Date(email.lastSent).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    };

    return (
      <div className="relative">
        <button
          onClick={handleSendEmail}
          disabled={isLoading}
          className={clsx(
            "relative w-max px-4 text-white bg-neutral-700 transition ease-in-out",
            {
              "h-9 rounded-full": !isMobile,
              "h-12 w-full rounded-full": isMobile,
              "bg-opacity-50": isLoading,
              "hover:bg-neutral-700/85 active:bg-neutral-700/85": !isLoading,
            }
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-1 justify-center w-full h-full">
              <Spinner color="white" />
              <span className="text-white">Sending</span>
            </div>
          ) : (
            <span className="text-white">
              Email customer ({email.sentCount}/{email.maxAllowed})
            </span>
          )}
        </button>
        {!isLoading && (
          <span className="text-xs text-gray italic absolute top-10 left-4">
            {email.sentCount === 0 ? "Awaiting first send" : getLastSentText()}
          </span>
        )}
      </div>
    );
  };

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
                  {overlayTitles[emailType]}
                </span>
              </button>
              {renderSendButton()}
            </div>
            <div className="p-5 pt-8">
              <div className="border border-dashed rounded-lg overflow-hidden">
                {renderEmailTemplate()}
              </div>
            </div>
            <div className="w-full pb-5 pt-2 px-5 md:hidden">
              {renderSendButton(true)}
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
