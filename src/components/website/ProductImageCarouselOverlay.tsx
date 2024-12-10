import React, { useMemo } from "react";
import Image from "next/image";
import { CloseIconThin } from "@/icons";

export function ProductImageCarouselOverlay({
  product,
  onClose,
}: ProductImageCarouselOverlayType) {
  const allImages = useMemo(() => {
    const primaryImages: ProductImage[] = [
      { src: product.images.main, alt: product.name },
      ...product.images.gallery.map((src) => ({ src, alt: product.name })),
    ];

    const colorImages: ProductImage[] = product.options.colors
      .filter((color) => color.image !== product.images.main)
      .map((color) => ({
        src: color.image,
        alt: color.name,
      }));

    return [...primaryImages, ...colorImages];
  }, [product.images.main, product.images.gallery, product.options.colors]);

  return (
    <div className="custom-scrollbar flex justify-center py-20 w-screen h-screen overflow-x-hidden overflow-y-auto z-30 fixed top-0 left-0 bg-black/15">
      <div className="w-[calc(100%-36px)] max-w-[580px] max-h-[764px] relative overflow-hidden rounded-2xl shadow bg-white">
        <div className="h-full pt-5 pb-8 flex flex-col relative">
          <div className="pb-3 px-5">
            <p className="font-semibold text-center">{product.name}</p>
          </div>
          <div className="pl-5 pr-2 custom-scrollbar overflow-x-hidden overflow-y-auto">
            <div className="flex gap-2 flex-col">
              {allImages.map((image) => (
                <div
                  key={image.src}
                  className="w-full max-w-[580px] aspect-square overflow-hidden flex items-center justify-center mx-auto"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={580}
                    height={580}
                    priority={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full absolute top-[6px] right-[6px] flex items-center justify-center transition hover:bg-lightgray"
          aria-label="Close carousel"
        >
          <CloseIconThin size={24} className="stroke-gray" />
        </button>
      </div>
    </div>
  );
}

// -- Type Definitions --

type ProductImage = {
  src: string;
  alt: string;
};

type ProductImageCarouselOverlayType = {
  product: {
    name: string;
    images: {
      main: string;
      gallery: string[];
    };
    options: {
      colors: Array<{
        name: string;
        image: string;
      }>;
    };
  };
  onClose: () => void;
};
