"use client";

import { CreateUpsellAction } from "@/actions/upsells";
import AlertMessage from "@/components/shared/AlertMessage";
import { isValidRemoteImage } from "@/lib/utils";
import { useState, useEffect } from "react";
import Spinner from "@/ui/Spinners/White";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { useNavbarMenuStore } from "@/zustand/admin/navbarMenuStore";
import { ArrowLeftIcon, CloseIcon } from "@/icons";
import clsx from "clsx";
import Image from "next/image";
import Overlay from "@/ui/Overlay";
import { AlertMessageType } from "@/lib/sharedTypes";

export function NewUpsellMenuButton() {
  const { showOverlay } = useOverlayStore();
  const { setNavbarMenu } = useNavbarMenuStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.upsells.name,
    overlayName: state.pages.upsells.overlays.newUpsell.name,
  }));

  const openOverlay = () => {
    setNavbarMenu(false);
    showOverlay({ pageName, overlayName });
  };

  return (
    <button
      type="button"
      className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray"
      onClick={openOverlay}
    >
      New upsell
    </button>
  );
}

export function NewUpsellEmptyGridButton() {
  const { showOverlay } = useOverlayStore();
  const { setNavbarMenu } = useNavbarMenuStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.upsells.name,
    overlayName: state.pages.upsells.overlays.newUpsell.name,
  }));

  const openOverlay = () => {
    setNavbarMenu(false);
    showOverlay({ pageName, overlayName });
  };

  return (
    <button
      type="button"
      className="h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue active:bg-blue-dimmed lg:hover:bg-blue-dimmed"
      onClick={openOverlay}
    >
      New upsell
    </button>
  );
}

export function NewUpsellOverlay() {
  const [loading, setLoading] = useState(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    price: "",
    salePrice: "",
    mainImage: "",
  });

  const { hideOverlay } = useOverlayStore();

  const { pageName, isOverlayVisible, overlayName } = useOverlayStore(
    (state) => ({
      pageName: state.pages.upsells.name,
      overlayName: state.pages.upsells.overlays.newUpsell.name,
      isOverlayVisible: state.pages.upsells.overlays.newUpsell.isVisible,
    })
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (
      (name === "price" || name === "salePrice") &&
      !/^\d*\.?\d*$/.test(value)
    ) {
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const result = await CreateUpsellAction(formData);
      setAlertMessageType(result.type);
      setAlertMessage(result.message);
      setShowAlert(true);
    } catch (error) {
      console.error("Error creating upsell:", error);
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Failed to create upsell");
      setShowAlert(true);
    } finally {
      setLoading(false);
      onHideOverlay();
    }
  };

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
    setFormData({
      price: "",
      salePrice: "",
      mainImage: "",
    });
  };

  const hideAlertMessage = () => {
    setShowAlert(false);
    setAlertMessage("");
    setAlertMessageType(AlertMessageType.NEUTRAL);
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">New upsell</h2>
                  <button
                    onClick={onHideOverlay}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={onHideOverlay}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray"
                >
                  <ArrowLeftIcon
                    className="fill-blue -ml-[2px]"
                    size={20}
                  />
                  <span className="font-semibold text-sm text-blue">
                    New upsell
                  </span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue",
                    {
                      "bg-opacity-50": loading,
                      "active:bg-blue-dimmed": !loading,
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
              <div className="w-full h-full mt-[52px] md:mt-0 px-5 pt-5 pb-28 md:pb-10 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <div className="flex flex-col gap-2">
                  <label htmlFor="price" className="font-semibold text-sm">
                    Price
                  </label>
                  <div className="w-full h-9 relative">
                    <input
                      type="text"
                      name="price"
                      placeholder="137.99"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-blue"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="salePrice" className="font-semibold text-sm">
                    Sale price
                  </label>
                  <div className="w-full h-9 relative">
                    <input
                      type="text"
                      name="salePrice"
                      placeholder="55.99"
                      value={formData.salePrice}
                      onChange={handleInputChange}
                      className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-blue"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="mainImage" className="font-semibold text-sm">
                    Main image
                  </label>
                  <div>
                    <div className="w-full max-w-[383px] border rounded-md overflow-hidden">
                      <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
                        {formData.mainImage &&
                          isValidRemoteImage(formData.mainImage) && (
                            <Image
                              src={formData.mainImage}
                              alt="Upsell"
                              width={383}
                              height={383}
                              priority
                            />
                          )}
                      </div>
                      <div className="w-full h-9 border-t overflow-hidden">
                        <input
                          type="text"
                          name="mainImage"
                          placeholder="Paste image URL"
                          value={formData.mainImage}
                          onChange={handleInputChange}
                          className="h-full w-full px-3 text-gray"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0">
              <button
                onClick={handleSave}
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue",
                  {
                    "bg-opacity-50": loading,
                    "active:bg-blue-dimmed": !loading,
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
