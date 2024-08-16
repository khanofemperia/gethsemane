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
      <div className="relative overflow-hidden shadow rounded-2xl bg-white">
        <div className="w-[640px] h-full pt-[40px] pb-[85px] flex flex-col relative">
          <div className="w-max mx-auto flex gap-y-1 gap-x-2 *:w-7 *:h-7 *:rounded-full *:bg-lightgray *:flex *:items-center *:justify-center *:text-xs">
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
            <div>5</div>
          </div>
          <div className="custom-scrollbar overflow-x-hidden overflow-y-visible">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Est
            recusandae amet rem sint aliquid quod architecto quas iure, tenetur
            enim, aperiam cupiditate. Possimus iusto et commodi facere alias
            eius deleniti. Enim maxime architecto asperiores sit illum cum
            provident debitis nesciunt, corporis totam quis omnis, inventore
            expedita error, eum voluptatem quibusdam eveniet? Molestiae quis
            laboriosam quaerat eos cupiditate atque, nemo totam? Possimus
            repellendus maiores repudiandae et quidem, quas tempore aspernatur
            eligendi facere voluptate sequi deleniti animi harum eum eius
            quisquam hic iusto odio qui voluptas ducimus! Nobis aliquam
            inventore consequuntur corrupti! A neque quia vero voluptas,
            nesciunt culpa facilis dolorem est accusantium, ipsum vel asperiores
            fugiat molestias, praesentium repellendus rem nostrum magni enim.
            Aliquid quidem laudantium expedita ipsa. Dicta, labore excepturi!
            Esse mollitia perspiciatis officiis blanditiis nesciunt natus.
            Voluptas quae quis ipsam suscipit laboriosam porro eos numquam
            temporibus repellendus, molestias qui nihil expedita nisi maiores
            enim dignissimos ducimus perspiciatis eveniet! Est? Beatae iure
            commodi consectetur possimus nobis ullam ad inventore ipsum
            provident, ab fuga repudiandae accusantium nesciunt illum quasi
            quibusdam numquam sit quidem. Quisquam unde repudiandae, quibusdam
            vitae tenetur repellendus doloremque? Fugiat labore ipsum ut id
            cupiditate exercitationem, nam alias vitae illo repellendus
            perspiciatis sequi ducimus? Magnam laborum sit similique! Veritatis,
            corrupti? Excepturi officiis impedit aspernatur quae incidunt
            aliquid ipsam esse! Nihil iure animi repellat cumque tempora eaque,
            voluptatum autem illo. Aliquid dolorum laboriosam deserunt quia
            animi hic, corrupti natus modi dolore! Ea suscipit magni alias
            dolore optio voluptatibus ratione minima!
          </div>
          <div className="absolute left-0 right-0 bottom-0">
            <div className="h-[85px] bg-slate-300"></div>
          </div>
        </div>
        <button className="w-9 h-9 rounded-full absolute top-2 right-2 flex items-center justify-center ease-in-out transition duration-300 hover:bg-lightgray"></button>
      </div>
    </div>
  );
}
