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
    <div className="custom-scrollbar flex justify-center py-20 w-screen h-screen overflow-x-hidden overflow-y-visible z-40 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="h-max w-max max-w-[1024px] p-8 relative overflow-hidden shadow rounded-2xl bg-white">
        <div className="grid grid-cols-[436px_320px] gap-5">
          <div className="w-[436px] h-[436px] items-center justify-center rounded-3xl overflow-hidden">
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              width={480}
              height={480}
              priority
              className="object-cover w-full h-full"
            />
          </div>
          <div className="h-full w-[320px]">
            <p className="font-semibold text-lg mb-4">{product.name}</p>
            <div className="grid grid-cols-3 gap-2">
              {allImages.map((image, index) => (
                <div
                  key={index}
                  className={clsx(
                    "w-[100px] h-[100px] overflow-hidden rounded-lg cursor-pointer transition-all duration-200",
                    currentImage.src === image.src
                      ? "ring-2 ring-blue-500 ring-offset-2"
                      : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                  )}
                  onClick={() => handleImageSelect(image)}
                  onMouseEnter={() => handleImageSelect(image)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={100}
                    height={100}
                    priority
                    className="object-cover w-full h-full"
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
