"use client";

import { memo, useEffect, useState } from "react";
import { useProductColorImageStore } from "@/zustand/website/ProductColorImageStore";
import styles from "./styles.module.css";
import Image from "next/image";

export function ImageGallery({ images, productName }: ProductImagesType) {
  const [currentImage, setCurrentImage] = useState(images.main);
  const [nextImage, setNextImage] = useState<string | null>(null);
  const [isCurrentImageLoaded, setIsCurrentImageLoaded] = useState(false);
  const [isNextImageLoaded, setIsNextImageLoaded] = useState(false);

  const { selectedColorImage, resetSelectedColorImage } =
    useProductColorImageStore();

  useEffect(() => {
    resetSelectedColorImage();
    // Preload all images
    const productImages = [images.main, ...(images.gallery ?? [])];
    productImages.forEach((imgSrc) => {
      const img = new window.Image();
      img.src = imgSrc;
    });
  }, []);

  const handleImageSelect = (image: string) => {
    const activeImage = selectedColorImage || currentImage;
    if (image === activeImage) return;

    // Start loading the next image before switching
    setNextImage(image);
    setIsNextImageLoaded(false);

    if (selectedColorImage) {
      resetSelectedColorImage();
    }
  };

  // When next image is loaded, make the switch
  useEffect(() => {
    if (isNextImageLoaded && nextImage) {
      setCurrentImage(nextImage);
      setNextImage(null);
      setIsCurrentImageLoaded(true);
    }
  }, [isNextImageLoaded, nextImage]);

  const displayImage = selectedColorImage || currentImage;
  const productImages = [images.main, ...(images.gallery ?? [])];

  return (
    <div className="flex w-full select-none">
      <div
        className={`${styles.customScrollbar} apply-scrollbar min-w-[62px] max-w-[62px] max-h-[380px] overflow-x-hidden overflow-y-visible flex flex-col gap-2 mr-2`}
      >
        {productImages.map((image, index) => (
          <ThumbnailImage
            key={index}
            image={image}
            productName={productName}
            onSelect={handleImageSelect}
          />
        ))}
      </div>
      <div className="w-full max-w-[580px] h-full flex flex-col gap-5">
        <div className="w-full aspect-square relative flex items-center justify-center bg-lightgray overflow-hidden rounded-3xl [box-shadow:0px_1.6px_3.6px_rgb(0,_0,_0,_0.4),_0px_0px_2.9px_rgb(0,_0,_0,_0.1)]">
          {/* Current image */}
          <Image
            src={displayImage}
            alt={productName}
            fill
            priority
            sizes="(max-width: 580px) 100vw, 580px"
            className={`object-cover transition-opacity duration-100 ${
              isCurrentImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoadingComplete={() => setIsCurrentImageLoaded(true)}
          />

          {/* Preload next image */}
          {nextImage && (
            <Image
              src={nextImage}
              alt={productName}
              fill
              priority
              sizes="(max-width: 580px) 100vw, 580px"
              className="opacity-0 absolute"
              onLoadingComplete={() => setIsNextImageLoaded(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const ThumbnailImage = memo(function ThumbnailImage({
  image,
  productName,
  onSelect,
}: {
  image: string;
  productName: string;
  onSelect: (image: string) => void;
}) {
  return (
    <div
      onMouseEnter={() => onSelect(image)}
      onClick={() => onSelect(image)}
      className="w-[56px] h-[56px] relative min-h-[56px] min-w-[56px] rounded-md flex items-center justify-center overflow-hidden"
    >
      <Image
        src={image}
        alt={productName}
        width={56}
        height={68}
        priority={true}
      />
      <div className="w-full h-full rounded-md absolute top-0 bottom-0 left-0 right-0 ease-in-out duration-200 transition hover:bg-amber/30" />
    </div>
  );
});

type ProductImagesType = {
  images: {
    main: string;
    gallery: string[];
  };
  productName: string;
};
