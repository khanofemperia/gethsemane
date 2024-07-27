"use client";

import AlertMessage from "@/components/shared/AlertMessage";
import { isValidRemoteImage } from "@/lib/utils";
import { FormEvent, useState, useEffect } from "react";
import Spinner from "@/ui/Spinners/White";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeftIcon, CloseIcon, EditIcon } from "@/icons";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { UpdateUpsellAction } from "@/actions/upsells";
import Image from "next/image";
import { AlertMessageType } from "@/lib/sharedTypes";

type DataType = {
  id: string;
  mainImage: string;
  pricing: {
    basePrice: number;
    salePrice?: number;
  };
};

export function BasicDetailsButton({ className }: { className: string }) {
  const { showOverlay } = useOverlayStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.editUpsell.name,
    overlayName: state.pages.editUpsell.overlays.basicDetails.name,
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

export function BasicDetailsOverlay({ data }: { data: DataType }) {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );
  const [formData, setFormData] = useState({
    id: data.id,
    mainImage: data.mainImage,
    basePrice: data.pricing.basePrice,
    salePrice: data.pricing.salePrice || 0,
  });

  const { hideOverlay } = useOverlayStore();

  const { pageName, isOverlayVisible, overlayName } = useOverlayStore(
    (state) => ({
      pageName: state.pages.editUpsell.name,
      overlayName: state.pages.editUpsell.overlays.basicDetails.name,
      isOverlayVisible: state.pages.editUpsell.overlays.basicDetails.isVisible,
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

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
  };

  const hideAlertMessage = () => {
    setShowAlert(false);
    setAlertMessage("");
    setAlertMessageType(AlertMessageType.NEUTRAL);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);

    try {
      const updatedUpsell = {
        id: data.id,
        mainImage: formData.mainImage,
        pricing: {
          basePrice: formData.basePrice,
          salePrice: formData.salePrice,
        },
      };

      const result = await UpdateUpsellAction(updatedUpsell);
      setAlertMessageType(result.type);
      setAlertMessage(result.message);
      setShowAlert(true);
    } catch (error) {
      console.error("Error updating upsell:", error);
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Failed to update upsell");
      setShowAlert(true);
    } finally {
      setLoading(false);
      onHideOverlay();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <form onSubmit={handleSave}>
              <div className="w-full h-[calc(100vh-188px)] md:h-auto">
                <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                  <div className="relative flex justify-center items-center w-full h-7">
                    <h2 className="font-semibold text-lg">Basic details</h2>
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
                    <ArrowLeftIcon className="fill-blue -ml-[2px]" size={20} />
                    <span className="font-semibold text-sm text-blue">
                      Basic details
                    </span>
                  </button>
                  <button
                    type="submit"
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
                    <label
                      htmlFor="basePrice"
                      className="font-semibold text-sm"
                    >
                      Base price
                    </label>
                    <div className="w-full h-9 relative">
                      <input
                        type="text"
                        name="basePrice"
                        placeholder="137.99"
                        value={formData.basePrice}
                        onChange={handleInputChange}
                        className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-blue"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="salePrice"
                      className="font-semibold text-sm"
                    >
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
                    <label
                      htmlFor="mainImage"
                      className="font-semibold text-sm"
                    >
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
                  type="submit"
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
            </form>
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
