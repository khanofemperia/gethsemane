"use client";

import { QuickviewButton } from "./Quickview";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { ComponentPropsWithRef, useCallback, useEffect, useState } from "react";
import { EmblaCarouselType } from "embla-carousel";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { useRouter } from "next/navigation";
import { formatThousands } from "@/lib/utils";

type CollectionProductType = {
  index: number;
  id: string;
};

type CollectionType = {
  id: string;
  index: number;
  title: string;
  slug: string;
  campaignDuration: DateRangeType;
  collectionType: string;
  bannerImages?: {
    desktopImage: string;
    mobileImage: string;
  };
  products: CollectionProductType[];
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
};

type EnrichedProductType = CollectionProductType & ProductType;

type EnrichedCollectionType = Omit<CollectionType, "products"> & {
  products: EnrichedProductType[];
};

type UsePrevNextButtonsType = {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
};

export const usePrevNextButtons = (
  emblaApi: EmblaCarouselType | undefined
): UsePrevNextButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

type PropType = ComponentPropsWithRef<"button">;

export const PrevButton: React.FC<PropType> = (props) => {
  const { children, ...restProps } = props;

  return (
    <button
      className="embla__button embla__button--prev disabled:hidden cursor-pointer w-9 h-9 rounded-full absolute left-4 lg:-left-3 top-[44px] bg-neutral-800 bg-opacity-75 flex items-center justify-center transition duration-300 ease-in-out active:bg-opacity-100 lg:hover:bg-opacity-100"
      type="button"
      {...restProps}
    >
      <ChevronLeftIcon className="stroke-white mr-[2px]" size={22} />
      {children}
    </button>
  );
};

export const NextButton: React.FC<PropType> = (props) => {
  const { children, ...restProps } = props;

  return (
    <button
      className="embla__button embla__button--next disabled:hidden cursor-pointer w-9 h-9 rounded-full absolute right-4 lg:-right-3 top-[44px] bg-neutral-800 bg-opacity-75 flex items-center justify-center transition duration-300 ease-in-out active:bg-opacity-100 lg:hover:bg-opacity-100"
      type="button"
      {...restProps}
    >
      <ChevronRightIcon className="stroke-white ml-[2px]" size={22} />
      {children}
    </button>
  );
};

export function FeaturedProducts({
  collection,
}: {
  collection: EnrichedCollectionType;
}) {
  const router = useRouter();
  const { id, slug, title, products } = collection;
  const [emblaRef] = useEmblaCarousel({
    align: "start",
  });

  return (
    <>
      <div className="mx-auto mb-2 md:mb-4 pl-[24px] pr-[22px] flex items-center justify-between md:justify-normal gap-4">
        <h2 className="font-semibold line-clamp-3 md:text-[1.375rem] md:leading-7">
          {title}
        </h2>
        <Link
          href={`/collections/${slug}-${id}`}
          className="text-sm rounded-full px-3 h-8 text-nowrap flex items-center justify-center transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
        >
          See more
        </Link>
      </div>
      <div
        className="embla py-1 px-[14px] overflow-hidden relative select-none"
        ref={emblaRef}
      >
        <div className="embla__container select-none w-full flex gap-1 md:gap-0">
          {products
            .slice(0, 3)
            .map(
              ({
                id,
                index,
                name,
                slug,
                pricing,
                images,
              }: EnrichedProductType) => (
                <div
                  key={index}
                  className="min-w-[244px] w-[244px] md:min-w-[33.333333%] md:w-[33.333333%] p-[10px] cursor-pointer rounded-2xl ease-in-out duration-300 transition hover:shadow-[0px_0px_4px_rgba(0,0,0,0.35)]"
                >
                  <Link
                    href={`/${slug}-${id}`}
                    className="w-full aspect-square rounded-xl flex items-center justify-center overflow-hidden"
                  >
                    <Image
                      src={images.main}
                      alt={name}
                      width={1000}
                      height={1000}
                      priority={true}
                    />
                  </Link>
                  <div
                    className="pt-[10px] flex flex-col gap-[6px]"
                    onClick={() => router.push(`/${slug}-${id}`)}
                  >
                    <p className="text-sm line-clamp-1">{name}</p>
                    <div className="flex items-center justify-between w-full">
                      <div className="w-max flex items-center justify-center">
                        {Number(pricing.salePrice) ? (
                          <div className="flex items-center gap-[6px]">
                            <span className="font-medium">
                              ${formatThousands(Number(pricing.salePrice))}
                            </span>
                            <span className="text-xs text-gray line-through mt-[2px]">
                              ${formatThousands(Number(pricing.basePrice))}
                            </span>
                            <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-[10px] px-[5px] flex items-center justify-center">
                              -{pricing.discountPercentage}%
                            </span>
                          </div>
                        ) : (
                          <p className="font-medium">
                            ${formatThousands(Number(pricing.basePrice))}
                          </p>
                        )}
                      </div>
                      <QuickviewButton
                        onClick={(event) => event.stopPropagation()}
                        productId={id}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
        </div>
      </div>
    </>
  );
}
