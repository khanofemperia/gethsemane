"use client";

import { CreateProductAction } from "@/actions/products";
import AlertMessage from "@/components/shared/AlertMessage";
import { capitalizeFirstLetter, isValidRemoteImage } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import Spinner from "@/ui/Spinners/White";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { useNavbarMenuStore } from "@/zustand/admin/navbarMenuStore";
import { ArrowLeftIcon, ChevronDownIcon, CloseIcon } from "@/icons";
import clsx from "clsx";
import Image from "next/image";
import Overlay from "@/ui/Overlay";
import { AlertMessageType } from "@/lib/sharedTypes";
import { getCategories } from "@/lib/getData";

export function UpsellReviewButton() {
  const { showOverlay } = useOverlayStore();
  const { setNavbarMenu } = useNavbarMenuStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.products.name,
    overlayName: state.pages.products.overlays.newProduct.name,
  }));

  const openOverlay = () => {
    setNavbarMenu(false);
    showOverlay({ pageName, overlayName });
  };

  return (
    <button
      type="button"
      className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
      onClick={openOverlay}
    >
      New product
    </button>
  );
}

export function UpsellReviewOverlay() {
  return (
    <div className="custom-scrollbar flex justify-center py-20 w-screen h-screen overflow-x-hidden overflow-y-visible z-20 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="w-[800px] p-10 absolute top-16 bottom-16 bg-white mx-auto shadow rounded-2xl">
        <div className="flex flex-row gap-8 custom-scrollbar max-h-[554px] h-full overflow-x-hidden overflow-y-visible">
          <div className="w-full">
            <div className="w-max max-w-[294px] h-8 mx-auto flex flex-wrap items-center justify-center gap-y-2 gap-x-4">
              <div className="w-7 h-7 rounded-full text-sm flex items-center justify-center bg-lightgray">
                1
              </div>
              <div className="w-7 h-7 rounded-full text-sm flex items-center justify-center bg-lightgray">
                2
              </div>
              <div className="w-7 h-7 rounded-full text-sm flex items-center justify-center bg-lightgray">
                3
              </div>
              <div className="w-7 h-7 rounded-full text-sm flex items-center justify-center bg-lightgray">
                4
              </div>
              <div className="w-7 h-7 rounded-full text-sm flex items-center justify-center bg-lightgray">
                5
              </div>
              <div className="w-7 h-7 rounded-full text-sm flex items-center justify-center bg-lightgray">
                6
              </div>
              <div className="w-7 h-7 rounded-full text-sm flex items-center justify-center bg-lightgray">
                7
              </div>
              <div className="w-7 h-7 rounded-full text-sm flex items-center justify-center bg-lightgray">
                8
              </div>
              <div className="w-7 h-7 rounded-full text-sm flex items-center justify-center bg-lightgray">
                9
              </div>
              <div className="w-7 h-7 rounded-full text-sm flex items-center justify-center bg-lightgray">
                10
              </div>
            </div>
          </div>
        </div>
        <button
          // onClick={hideOverlay}
          className="h-8 w-8 rounded-full absolute right-2 top-2 flex items-center justify-center"
          type="button"
        >
          <CloseIcon size={18} className="fill-gray" />
        </button>
      </div>
    </div>
  );
}
