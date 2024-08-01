"use client";

import AlertMessage from "@/components/shared/AlertMessage";
import { useState, useEffect } from "react";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeftIcon, CloseIcon, EditIcon } from "@/icons";
import Overlay from "@/ui/Overlay";
import Image from "next/image";
import { formatThousands } from "@/lib/utils";
import Link from "next/link";
import {
  ChangeProductIndexButton,
  ChangeProductIndexOverlay,
} from "./ChangeProductIndexOverlay";
import { AlertMessageType } from "@/lib/sharedTypes";

type ProductType = {
  index: number;
  id: string;
  slug: string;
  name: string;
  mainImage: string;
  basePrice: number;
};

export function ProductsButton({ className }: { className: string }) {
  const { showOverlay } = useOverlayStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.editUpsell.name,
    overlayName: state.pages.editUpsell.overlays.products.name,
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

export function ProductsOverlay({
  data,
}: {
  data: { id: string; products: ProductType[] };
}) {
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );

  const { hideOverlay } = useOverlayStore();

  const { pageName, isOverlayVisible, overlayName } = useOverlayStore(
    (state) => ({
      pageName: state.pages.editUpsell.name,
      overlayName: state.pages.editUpsell.overlays.products.name,
      isOverlayVisible: state.pages.editUpsell.overlays.products.isVisible,
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
    hideOverlay({ pageName, overlayName });
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
          <div className="md:mx-auto md:mt-20 md:mb-[50vh] md:px-5 lg:p-0">
            <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] mx-auto ease-in-out duration-300 transition overflow-hidden md:overflow-visible rounded-t-3xl bg-white md:w-full md:max-w-[773.8px] md:rounded-2xl md:shadow md:h-max md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
              <div className="w-full">
                <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                  <div className="relative flex justify-center items-center w-full h-7">
                    <h2 className="font-semibold text-lg">Products</h2>
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
                      Products
                    </span>
                  </button>
                </div>
                <div className="w-full h-full mt-[52px] md:mt-0 px-5 pt-5 pb-28 md:pb-10 flex flex-col gap-2 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                  <div className="w-full h-full py-3 border rounded-xl bg-white">
                    <div className="h-full">
                      <div className="h-full overflow-auto custom-x-scrollbar">
                        <table className="w-full text-sm">
                          <thead className="border-y bg-neutral-100">
                            <tr className="h-10 *:font-semibold *:text-gray">
                              <td className="text-center border-r">#</td>
                              <td className="pl-3 border-r">Image</td>
                              <td className="pl-3 border-r">Name</td>
                              <td className="pl-3 border-r">Base price</td>
                              <td className="pl-3"></td>
                            </tr>
                          </thead>
                          <tbody className="*:h-[98px] *:border-b">
                            {data.products.map(
                              ({ id, index, mainImage, name, basePrice }) => (
                                <tr key={id} className="h-[98px] max-h-[98px]">
                                  <td className="max-w-14 min-w-14 text-center font-medium border-r">
                                    {index}
                                  </td>
                                  <td className="p-3 max-w-[120px] min-w-[120px] border-r">
                                    <div className="aspect-square w-full overflow-hidden flex items-center justify-center bg-white">
                                      <Image
                                        src={mainImage}
                                        alt={name}
                                        width={216}
                                        height={216}
                                        priority
                                      />
                                    </div>
                                  </td>
                                  <td className="px-3 max-w-[200px] min-w-[200px] border-r">
                                    <p className="line-clamp-2">{name}</p>
                                  </td>
                                  <td className="px-3 max-w-[100px] min-w-[100px] border-r">
                                    <p>${formatThousands(basePrice)}</p>
                                  </td>
                                  <td className="px-3 max-w-[140px] min-w-[140px]">
                                    <div className="flex items-center justify-center">
                                      <Link
                                        href={`#`}
                                        className="h-9 w-9 rounded-full flex items-center justify-center ease-in-out duration-300 transition active:bg-lightgray lg:hover:bg-lightgray"
                                      >
                                        <EditIcon size={20} />
                                      </Link>
                                      <ChangeProductIndexButton
                                        upsellId={data.id}
                                        product={{
                                          id,
                                          name,
                                          index,
                                        }}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
      <ChangeProductIndexOverlay />
    </>
  );
}
