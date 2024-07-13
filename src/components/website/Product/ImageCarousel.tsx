"use client";

import Image from "next/image";
import { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type ImageCarouselType = {
  images: string[];
  productName: string;
};

export default function ImageCarousel({
  images,
  productName,
}: ImageCarouselType) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (current: number) => setCurrentIndex(current),
    arrows: false,
  };

  return (
    <div className="relative select-none">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div
            className="w-full aspect-square flex items-center justify-center overflow-hidden"
            key={index}
          >
            <Image
              src={image}
              alt={`${productName} - ${index + 1}`}
              width={768}
              height={768}
              priority={true}
            />
          </div>
        ))}
      </Slider>
      <div className="flex items-center justify-center absolute bottom-5 right-[14px] bg-black/80 text-sm text-white px-3 h-6 rounded-full transition duration-300 ease-in-out">
        {currentIndex + 1}/{images.length}
      </div>
    </div>
  );
}
