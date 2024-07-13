import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { QuickviewButton } from "./Quickview";

export function FeaturedProducts({
  collection,
}: {
  collection: CollectionType;
}) {
  const { id, slug, title, products } = collection;
  return (
    <>
      <div className="w-full max-w-[968px] mx-auto mb-2 md:mb-4 pl-[26px] pr-[22px] flex items-center justify-between md:justify-normal gap-4">
        <h2 className="font-semibold line-clamp-3 md:text-[1.375rem] md:leading-7">
          {title}
        </h2>
        <Link
          href={`/shop/collections/${slug.toLowerCase()}-${id}`}
          className="text-sm rounded-full px-3 h-8 text-nowrap flex items-center justify-center transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
        >
          See more
        </Link>
      </div>
      <div className="relative mx-auto w-full max-w-[968px]">
        <div className="invisible-scrollbar scroll-px-4 snap-x snap-mandatory w-full max-w-full overflow-x-scroll md:overflow-hidden flex gap-[2px] py-2 px-4">
          {products
            .slice(0, 3)
            .map(
              (
                {
                  id,
                  name,
                  mainImage,
                  price,
                  slug,
                  images,
                  description,
                  colors,
                  sizes,
                }: ProductType,
                index
              ) => (
                <div
                  key={index}
                  className="min-w-[244px] w-[244px] h-[308px] max-h-[376px] md:min-w-[33.333333%] md:w-[33.333333%] md:h-[calc(33.33vw+54px)] snap-always snap-center rounded-2xl select-none relative ease-in-out duration-300 transition hover:shadow-[0px_0px_4px_rgba(0,0,0,0.35)]"
                >
                  <Link
                    href={`/shop/${slug.toLowerCase()}-${id}`}
                    className="w-[224px] h-[224px] md:w-[calc(33.33vw-30px)] md:h-[calc(33.33vw-30px)] max-w-[292px] max-h-[292px] cursor-pointer aspect-square z-[1] absolute top-[10px] left-[10px] right-[10px] bg-gray rounded-xl flex items-center justify-center overflow-hidden"
                  >
                    <Image
                      src={mainImage}
                      alt={name}
                      width={1000}
                      height={1000}
                      priority={true}
                    />
                  </Link>
                  <ProductCard product={{ id, name, slug, price }} />
                  <QuickviewButton
                    product={{
                      id,
                      name,
                      price,
                      mainImage,
                      images,
                      description,
                      colors,
                      sizes,
                      slug,
                    }}
                  />
                </div>
              )
            )}
        </div>
      </div>
    </>
  );
}
