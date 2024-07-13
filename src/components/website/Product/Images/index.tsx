"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./styles.module.css";

type ProductImagesType = {
  images: string[];
  productName: string;
};

export default function Images({ images, productName }: ProductImagesType) {
  const [hoveredImage, setHoveredImage] = useState("");

  return (
    <div className="flex w-full select-none">
      <div
        className={`${styles.custom_scrollbar} apply-scrollbar min-w-[62px] max-w-[62px] max-h-[380px] overflow-x-hidden overflow-y-visible flex flex-col gap-2 mr-2`}
      >
        {images.map((image, index) => (
          <div
            onMouseEnter={() => setHoveredImage(image)}
            key={index}
            className="w-[56px] h-[56px] relative min-h-[56px] min-w-[56px] rounded-md flex items-center justify-center overflow-hidden"
          >
            <Image
              src={image}
              alt={productName}
              width={56}
              height={68}
              priority={true}
            />
            <div className="w-full h-full rounded-md absolute top-0 bottom-0 left-0 right-0 ease-in-out duration-200 transition hover:bg-amber/30"></div>
          </div>
        ))}
      </div>
      <div className="w-full max-w-[580px] h-full flex flex-col gap-5">
        <div className="w-full aspect-square relative flex items-center justify-center bg-lightgray overflow-hidden rounded-3xl [box-shadow:0px_1.6px_3.6px_rgb(0,_0,_0,_0.4),_0px_0px_2.9px_rgb(0,_0,_0,_0.1)]">
          <Image
            src={hoveredImage || images[0]}
            alt={productName}
            width={510}
            height={510}
            priority={true}
          />
        </div>
      </div>
    </div>
  );
}
