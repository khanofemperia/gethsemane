import Image from "next/image";
import { useState } from "react";
import { CloseIconThin } from "@/icons";
import clsx from "clsx";

type ProductImage = {
  src: string;
  alt: string;
};

type ProductImageCarouselProps = {
  product: {
    name: string;
    mainImage: string;
    options: {
      colors: Array<{
        name: string;
        image: string;
      }>;
    };
  };
  onClose: () => void;
};

export function ProductImageCarousel({
  product,
  onClose,
}: ProductImageCarouselProps) {
  // Create an array of unique images
  const allImages: ProductImage[] = [
    { src: product.mainImage, alt: product.name },
    ...product.options.colors
      .filter((color) => color.image !== product.mainImage) // Remove duplicates
      .map((color) => ({
        src: color.image,
        alt: color.name,
      })),
  ];

  const [currentImage, setCurrentImage] = useState<ProductImage>(allImages[0]);

  const handleImageSelect = (image: ProductImage) => {
    setCurrentImage(image);
  };

  return (
    <div className="custom-scrollbar flex justify-center py-20 w-screen h-screen overflow-x-hidden overflow-y-visible z-40 fixed top-0 bottom-0 left-0 right-0 bg-black/15">
      <div className="max-h-[612px] w-max max-w-[1024px] p-8 relative overflow-hidden shadow rounded-2xl bg-white">
        <div className="h-full flex gap-5">
          <div className="h-full aspect-square items-center justify-center rounded-3xl overflow-hidden">
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              width={544}
              height={544}
              priority
            />
          </div>
          <div className="h-full w-[320px]">
            <p className="font-semibold mb-5">{product.name}</p>
            <div className="flex gap-2 flex-wrap">
              {allImages.map((image, index) => (
                <div
                  key={index}
                  className={clsx(
                    "w-[74px] h-[74px] overflow-hidden rounded-md cursor-pointer",
                    {
                      "ring-1 ring-blue ring-offset-2":
                        currentImage.src === image.src,
                    }
                  )}
                  onClick={() => handleImageSelect(image)}
                  onMouseEnter={() => handleImageSelect(image)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={74}
                    height={74}
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full absolute top-[6px] right-[6px] flex items-center justify-center ease-in-out transition duration-300 hover:bg-lightgray"
        >
          <CloseIconThin size={24} className="stroke-gray" />
        </button>
      </div>
    </div>
  );
}
