"use client";

import { memo, useEffect } from "react";
import { useProductColorImageStore } from "@/zustand/website/ProductColorImageStore";
import styles from "./styles.module.css";
import Image from "next/image";
import { useState, useMemo } from "react";

export function ImageGallery({ images, productName }: ProductImagesType) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const { selectedColorImage, resetSelectedColorImage } =
    useProductColorImageStore();

  const productImages = useMemo(
    () => [images.main, ...(images.gallery ?? [])],
    [images.main, images.gallery]
  );

  useEffect(() => {
    resetSelectedColorImage();
  }, []);

  const handleImageSelect = (index: number) => {
    if (index === currentImageIndex) return;
    setCurrentImageIndex(index);
    setPreviewIndex(null);

    if (selectedColorImage) {
      resetSelectedColorImage();
    }
  };

  const handleMouseEnter = (index: number) => {
    setPreviewIndex(index);
  };

  const handleMouseLeave = () => {
    setPreviewIndex(null);
  };

  const displayedImage =
    selectedColorImage ||
    (previewIndex !== null
      ? productImages[previewIndex]
      : productImages[currentImageIndex]);

  return (
    <div className="flex w-full select-none">
      <div
        className={`${styles.customScrollbar} apply-scrollbar min-w-[62px] max-w-[62px] max-h-[380px] overflow-x-hidden overflow-y-visible flex flex-col gap-2 mr-2`}
      >
        {productImages.map((image, index) => (
          <ThumbnailImage
            key={image}
            image={image}
            productName={productName}
            onSelect={() => handleImageSelect(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
      <div className="w-full max-w-[580px] h-full flex flex-col gap-5">
        <div className="w-full aspect-square relative flex items-center justify-center bg-lightgray overflow-hidden rounded-3xl [box-shadow:0px_1.6px_3.6px_rgb(0,_0,_0,_0.4),_0px_0px_2.9px_rgb(0,_0,_0,_0.1)]">
          <Image
            src={displayedImage}
            alt={productName}
            width={580}
            height={580}
            priority
            className="object-cover transition-opacity duration-200"
            sizes="(max-width: 580px) 100vw, 580px"
          />
        </div>
      </div>
    </div>
  );
}

const ThumbnailImage = memo(function ThumbnailImage({
  image,
  productName,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: {
  image: string;
  productName: string;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="w-[56px] h-[56px] relative min-h-[56px] min-w-[56px] rounded-md flex items-center justify-center overflow-hidden"
    >
      <Image
        src={image}
        alt={productName}
        width={56}
        height={68}
        priority={false}
      />
      <div className="w-full h-full rounded-md absolute top-0 bottom-0 left-0 right-0 ease-in-out duration-200 transition hover:bg-amber/30" />
    </button>
  );
});

type ProductImagesType = {
  images: {
    main: string;
    gallery: string[];
  };
  productName: string;
};
