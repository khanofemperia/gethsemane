"use client";

import AlertMessage from "@/components/shared/AlertMessage";
import { useState, useEffect, useRef } from "react";
import Spinner from "@/ui/Spinners/White";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeftIcon, EditIcon } from "@/icons";
import clsx from "clsx";
import { AlertMessageType } from "@/lib/sharedTypes";
import { TextEditor } from "@/components/shared/TextEditor";
import { UpdateProductAction } from "@/actions/products";

type DataType = {
  id: string;
  description: string;
};

export function DescriptionButton({ className }: { className?: string }) {
  const { showOverlay } = useOverlayStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.editProduct.name,
    overlayName: state.pages.editProduct.overlays.description.name,
  }));

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray ${className}`}
    >
      <EditIcon size={20} />
    </button>
  );
}

export function DescriptionOverlay({ data }: { data: DataType }) {
  const [description, setDescription] = useState<string>(data.description);
  const [loading, setLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  const { hideOverlay } = useOverlayStore();

  const { pageName, isOverlayVisible, overlayName } = useOverlayStore(
    (state) => ({
      pageName: state.pages.editProduct.name,
      overlayName: state.pages.editProduct.overlays.description.name,
      isOverlayVisible: state.pages.editProduct.overlays.description.isVisible,
    })
  );

  useEffect(() => {
    if (isOverlayVisible || showAlert) {
      document.body.style.overflow = "hidden";

      requestAnimationFrame(() => {
        if (overlayRef.current) {
          overlayRef.current.scrollTo(0, 0);
        }
      });
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

  const addTargetBlankToLinks = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    doc.querySelectorAll("a").forEach((link) => {
      if (!link.getAttribute("target")) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });

    return doc.body.innerHTML;
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const processedDescription = addTargetBlankToLinks(description);

      const result = await UpdateProductAction({
        id: data.id,
        description: processedDescription,
      });
      setAlertMessageType(result.type);
      setAlertMessage(result.message);
      setShowAlert(true);
    } catch (error) {
      console.error("Error updating product:", error);
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Failed to update product");
      setShowAlert(true);
    } finally {
      setLoading(false);
      hideOverlay({ pageName, overlayName });
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <div
          ref={overlayRef}
          className="px-5 md:px-0 fixed top-0 bottom-0 left-0 right-0 z-50 transition duration-300 ease-in-out bg-glass-black backdrop-blur-sm overflow-x-hidden overflow-y-visible custom-scrollbar"
        >
          <div className="bg-white max-w-[640px] rounded-2xl shadow mx-auto mt-20 mb-[50vh] relative">
            <div className="flex items-center justify-between py-2 pr-4 pl-2">
              <button
                onClick={() => {
                  hideOverlay({ pageName, overlayName });
                }}
                type="button"
                className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray"
              >
                <ArrowLeftIcon className="fill-blue -ml-[2px]" size={20} />
                <span className="md:hidden font-semibold text-sm text-blue">
                  Description
                </span>
                <span className="hidden md:block font-semibold text-sm text-blue">
                  Product description
                </span>
              </button>
              <button
                onClick={handleSave}
                type="button"
                disabled={loading}
                className={clsx(
                  "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loading,
                    "active:bg-neutral-700": !loading,
                  }
                )}
              >
                {loading ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner />
                    <span className="text-white">Saving</span>
                  </div>
                ) : (
                  <span className="text-white">Save</span>
                )}
              </button>
            </div>
            <div className="w-full px-5 pt-5 pb-10">
              <TextEditor
                name="product-description"
                value={description}
                onChange={(newValue: string) => setDescription(newValue)}
              />
            </div>
          </div>
        </div>
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
