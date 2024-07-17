import {
  BasicDetailsOverlay,
  BasicDetailsButton,
} from "@/components/admin/EditProduct/BasicDetailsOverlay";
import DataChip from "@/ui/DataChip";
import { formatThousands, isValidRemoteImage } from "@/lib/utils";
import Image from "next/image";
import { notFound } from "next/navigation";
import styles from "./styles.module.css";
import {
  MainImageButton,
  MainImageOverlay,
} from "@/components/admin/EditProduct/MainImageOverlay";
import {
  ImagesButton,
  ImagesOverlay,
} from "@/components/admin/EditProduct/ImagesOverlay";
import {
  VisibilityButton,
  VisibilityOverlay,
} from "@/components/admin/EditProduct/VisibilityOverlay";
import {
  SizeChartButton,
  SizeChartOverlay,
} from "@/components/admin/EditProduct/SizeChartOverlay";
import {
  ColorsButton,
  ColorsOverlay,
} from "@/components/admin/EditProduct/ColorsOverlay";
import { DescriptionButton } from "@/components/admin/EditProduct/DescriptionOverlay";
import IDCopyButton from "@/components/shared/IDCopyButton";
import { getProduct } from "@/lib/getData";

export default async function EditProduct({
  params,
}: {
  params: { slug: string };
}) {
  const productId = params.slug.split("-").pop() as string;
  const product = await getProduct({ id: productId });

  if (!product) {
    notFound();
  }

  const {
    id,
    category,
    name,
    slug,
    pricing,
    images,
    options,
    description,
    visibility,
  } = product as ProductType;

  return (
    <>
      <div className="max-w-[768px] flex flex-col gap-10 px-5">
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Basic details</h2>
            <p className="text-sm md:max-w-[85%]">
              Important for SEO: a name that includes target keywords in the
              first four words, a short URL slug with three or four keywords,
              and prices that help your business grow while making customers
              feel they're getting a good deal.
            </p>
          </div>
          <div className="w-full relative shadow rounded-xl bg-white">
            <div className="w-[calc(100%-60px)]">
              <div className="p-5">
                <h3 className="text-xs text-gray mb-2">Category</h3>
                <p className="font-medium">{category}</p>
              </div>
              <div className="p-5">
                <h3 className="text-xs text-gray mb-2">Name</h3>
                <p className="font-medium max-w-[540px]">{name}</p>
              </div>
              <div className="p-5">
                <h3 className="text-xs text-gray mb-2">Price</h3>
                <p className="font-medium">
                  ${formatThousands(pricing.basePrice)}
                </p>
              </div>
              <div className="p-5">
                <h3 className="text-xs text-gray mb-2">Slug</h3>
                <p className="font-medium">
                  {slug}-{id}
                </p>
              </div>
            </div>
            <BasicDetailsButton />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Images</h2>
            <p className="text-sm md:max-w-[85%]">
              Images that show off your product, helping people see its features
              and quality. They grab attention and let customers imagine owning
              it.
            </p>
          </div>
          <div className="w-full relative shadow rounded-xl bg-white">
            <div className="p-5 flex flex-col gap-5">
              <div className="relative border rounded-xl p-5">
                <div>
                  <h3 className="text-xs text-gray mb-4">Main</h3>
                  <div>
                    {!images.main || !isValidRemoteImage(images.main) ? (
                      <p className="italic text-gray">Nothing yet</p>
                    ) : (
                      <div className="w-full max-w-[280px] rounded-xl aspect-square flex items-center justify-center overflow-hidden">
                        <Image
                          src={images.main}
                          alt={name}
                          width={280}
                          height={280}
                          priority
                        />
                      </div>
                    )}
                  </div>
                </div>
                <MainImageButton />
              </div>
              <div className="relative border rounded-xl p-5">
                <div>
                  <h3 className="text-xs text-gray mb-4">Gallery</h3>
                  <div className="flex flex-wrap gap-2">
                    {!images.gallery ||
                    images.gallery.every(
                      (image) => !isValidRemoteImage(image)
                    ) ? (
                      <p className="italic text-gray">Nothing yet</p>
                    ) : (
                      images.gallery.map(
                        (image, index) =>
                          isValidRemoteImage(image) && (
                            <div
                              key={index}
                              className="max-w-[148px] lg:max-w-[210px] w-[calc(50%-4px)] border rounded-xl aspect-square flex items-center justify-center overflow-hidden"
                            >
                              <Image
                                src={image}
                                alt={name}
                                width={210}
                                height={210}
                                priority
                              />
                            </div>
                          )
                      )
                    )}
                  </div>
                </div>
                <ImagesButton />
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Options</h2>
            <p className="text-sm md:max-w-[85%]">
              Products that come in different sizes make it easy for people to
              find what they're looking for. And with lots of colors available,
              everyone can show off their style and personality.
            </p>
          </div>
          <div className="w-full relative shadow rounded-xl bg-white">
            <div className="p-5 flex flex-col gap-5">
              <div className="relative border rounded-xl p-5">
                <div>
                  <h3 className="text-xs text-gray mb-4">Sizes</h3>
                  <div>
                    {/* {options.sizes.length ? (
                      <div className="w-full max-w-[508px] flex flex-wrap gap-2 *:h-9 *:min-w-14 *:px-4 *:rounded-full *:flex *:items-center *:justify-center *:bg-lightgray">
                        {options.sizes.map((size, index) => (
                          <span key={index}>{size.name}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="italic text-gray">Nothing yet</p>
                    )} */}
                  </div>
                </div>
                <SizeChartButton />
              </div>
              <div className="relative border rounded-xl p-5">
                <div>
                  <h3 className="text-xs text-gray mb-4">Gallery</h3>
                  <div className="flex flex-wrap gap-2">
                    {!images.gallery ||
                    images.gallery.every(
                      (image) => !isValidRemoteImage(image)
                    ) ? (
                      <p className="italic text-gray">Nothing yet</p>
                    ) : (
                      images.gallery.map(
                        (image, index) =>
                          isValidRemoteImage(image) && (
                            <div
                              key={index}
                              className="max-w-[148px] lg:max-w-[210px] w-[calc(50%-4px)] border rounded-xl aspect-square flex items-center justify-center overflow-hidden"
                            >
                              <Image
                                src={image}
                                alt={name}
                                width={210}
                                height={210}
                                priority
                              />
                            </div>
                          )
                      )
                    )}
                  </div>
                </div>
                <ImagesButton />
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm mb-4 md:max-w-[85%]">
            Products that come in different sizes make it easy for people to
            find what they're looking for. And with lots of colors available,
            everyone can show off their style and personality.
          </p>
          <div className="w-full shadow rounded-xl bg-white">
            <div className="w-full h-14 border-b flex items-center justify-between pl-5 pr-[10px]">
              <h2 className="font-semibold text-xl">Options</h2>
            </div>
            <div className="p-5">
              <div className="flex flex-col gap-5 *:border *:rounded-xl">
                <div>
                  <div className="w-full h-14 border-b flex items-center justify-between pl-5 pr-[10px]">
                    <h3 className="text-sm font-semibold">Sizes</h3>
                    <SizeChartButton />
                  </div>
                  <div className="p-5">
                    {/* {variants.sizes.length ? (
                      <div className="w-full max-w-[508px] flex flex-wrap gap-2 *:h-9 *:min-w-14 *:px-4 *:rounded-full *:flex *:items-center *:justify-center *:bg-lightgray">
                        {sizes.entryLabels.map((size, index) => (
                          <span key={index}>{size.name}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="italic text-gray">Nothing yet</p>
                    )} */}
                  </div>
                </div>
                <div>
                  <div className="w-full h-14 border-b flex items-center justify-between pl-5 pr-[10px]">
                    <h3 className="text-sm font-semibold">Colors</h3>
                    <ColorsButton />
                  </div>
                  {/* <div className="p-5 flex flex-wrap gap-2">
                    {!colors ||
                    !colors.some((color) => isValidRemoteImage(color.image)) ? (
                      <p className="italic text-gray">Nothing yet</p>
                    ) : (
                      colors.map(
                        (color, index) =>
                          isValidRemoteImage(color.image) && (
                            <div
                              key={index}
                              className="max-w-[148px] lg:max-w-[210px] w-[calc(50%-4px)] rounded-xl border flex flex-col items-center justify-center overflow-hidden"
                            >
                              <div className="w-full aspect-square overflow-hidden">
                                <Image
                                  src={color.image}
                                  alt={color.name}
                                  width={210}
                                  height={210}
                                  priority
                                />
                              </div>
                              <div className="w-full h-9 flex justify-center">
                                <div className="w-max max-w-full px-3 font-medium flex items-center text-nowrap overflow-x-visible overflow-y-hidden invisible-scrollbar">
                                  {color.name}
                                </div>
                              </div>
                            </div>
                          )
                      )
                    )}
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm mb-4 md:max-w-[85%]">
            Tell your product's story! Describe the features and benefits that
            make customers love it. Highlight what makes it unique and how it
            solves problems or improves lives. Keep it clear and concise, using
            descriptive language to engage the reader.
          </p>
          <div className="w-full shadow rounded-xl bg-white">
            <div className="w-full h-14 border-b flex items-center justify-between pl-5 pr-[10px]">
              <h2 className="font-semibold text-xl">Product description</h2>
              <DescriptionButton />
            </div>
            <div className="p-5">
              {!description ? (
                <p className="italic text-gray">Nothing yet</p>
              ) : (
                <div className="bg-lightgray p-5 rounded-2xl">
                  <div
                    className={`${styles.description} line-clamp-5`}
                    dangerouslySetInnerHTML={{ __html: description || "" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm mb-4 md:max-w-[85%]">
            Choose whether the product is a work-in-progress (draft) or ready to
            be seen (published), and decide if you want shoppers to see it or
            keep it private (hidden).
          </p>
          <div className="w-full max-w-[400px] shadow rounded-xl bg-white">
            <div className="w-full h-14 border-b flex items-center justify-between pl-5 pr-[10px]">
              <h2 className="font-semibold text-xl">Visibility</h2>
              <VisibilityButton />
            </div>
            <div className="p-5">
              <DataChip value={visibility as VisibilityType} />
            </div>
          </div>
        </div>
      </div>
      {/* <BasicDetailsOverlay data={{ id, category, name, slug, pricing }} /> */}
      {/* <MainImageOverlay data={{ id, images }} /> */}
      <ImagesOverlay data={{ id, images: images.gallery }} />
      {/* <ColorsOverlay data={{ id, options }} /> */}
      <SizeChartOverlay
        data={{
          id,
          // sizes: options.sizes,
          sizes: {
            inches: [
              {
                Size: "S",
                US: "4",
                Bust: "33.9-35.5",
                Waist: "26-27.6",
                Hips: "35.9-37.4",
                Height: "5'5\"-5'7\"",
              },
              {
                Size: "M",
                US: "6",
                Bust: "35.5-37",
                Waist: "27.6-29.2",
                Hips: "37.4-39",
                Height: "5'7\"-5'9\"",
              },
              {
                Size: "L",
                US: "8/10",
                Bust: "37.4-39.8",
                Waist: "29.6-31.9",
                Hips: "39.4-41.8",
                Height: "5'9\"-5'11\"",
              },
              {
                Size: "XL",
                US: "12",
                Bust: "39.8-42.2",
                Waist: "31.9-34.3",
                Hips: "41.8-44.1",
                Height: "5'9\"-5'11\"",
              },
              {
                Size: "XXL",
                US: "14",
                Bust: "42.2-44.5",
                Waist: "34.3-36.6",
                Hips: "44.1-46.5",
                Height: "5'11\"-6'1\"",
              },
            ],
            centimeters: [
              {
                Size: "S",
                US: "4",
                Bust: "86-90",
                Waist: "66-70",
                Hips: "91-95",
                Height: "165-170",
              },
              {
                Size: "M",
                US: "6",
                Bust: "90-94",
                Waist: "70-74",
                Hips: "95-99",
                Height: "170-175",
              },
              {
                Size: "L",
                US: "8/10",
                Bust: "95-101",
                Waist: "75-81",
                Hips: "100-106",
                Height: "175-180",
              },
              {
                Size: "XL",
                US: "12",
                Bust: "101-107",
                Waist: "81-87",
                Hips: "106-112",
                Height: "175-180",
              },
              {
                Size: "XXL",
                US: "14",
                Bust: "107-113",
                Waist: "87-93",
                Hips: "112-118",
                Height: "180-185",
              },
            ],
          },
        }}
      />
      {/* <DescriptionOverlay data={{ id, description }} />
      <VisibilityOverlay data={{ id, visibility }} /> */}
    </>
  );
}

const exampleProduct: ProductType = {
  id: "3256805147723941",
  name: "Spaghetti Strap Tank Top Sexy Backless Bandage Skinny Crop Tops 2024 Summer Elegant Lace Up Party Streetwear Women Camis",
  slug: "spaghetti-strap-tank-top-sexy-backless-bandage-skinny-crop-tops-2024",
  category: "Women's Clothing",
  description:
    "Elegant and versatile spaghetti strap tank top with sexy backless design and lace-up details. Perfect for summer parties and streetwear.",
  highlights: {
    headline:
      "Struggling with uncomfortable tops during summer? Say no more, our tank top guarantees comfort and style for every occasion!",
    keyPoints: [
      "Sexy backless design",
      "Lace-up details for adjustable fit",
      "Suitable for parties and streetwear",
      "2024 Summer collection",
    ],
  },
  pricing: {
    basePrice: 9.07,
    salePrice: 4.63,
    discountPercentage: 49,
  },
  images: {
    main: "https://ae01.alicdn.com/kf/S8d40f50a48814d10a1e84f2d5a27d834j/Spaghetti-Strap-Tank-Top-Sexy-Backless-Bandage-Skinny-Crop-Tops-2024-Summer-Elegant-Lace-Up-Party.jpg",
    gallery: [
      "https://ae01.alicdn.com/kf/S8d40f50a48814d10a1e84f2d5a27d834j/Spaghetti-Strap-Tank-Top-Sexy-Backless-Bandage-Skinny-Crop-Tops-2024-Summer-Elegant-Lace-Up-Party.jpg",
      "https://ae01.alicdn.com/kf/S3e7f7f9a9d3f4b0e9f0b8f8f8f8f8f8fX/Spaghetti-Strap-Tank-Top-Sexy-Backless-Bandage-Skinny-Crop-Tops-2024-Summer-Elegant-Lace-Up-Party.jpg",
    ],
  },
  options: {
    colors: [
      {
        name: "Brown",
        image:
          "https://ae01.alicdn.com/kf/S8d40f50a48814d10a1e84f2d5a27d834j/Spaghetti-Strap-Tank-Top-Sexy-Backless-Bandage-Skinny-Crop-Tops-2024-Summer-Elegant-Lace-Up-Party.jpg",
      },
      {
        name: "WHITE",
        image:
          "https://ae01.alicdn.com/kf/S3e7f7f9a9d3f4b0e9f0b8f8f8f8f8f8fX/Spaghetti-Strap-Tank-Top-Sexy-Backless-Bandage-Skinny-Crop-Tops-2024-Summer-Elegant-Lace-Up-Party.jpg",
      },
    ],
    sizes: {
      columns: [
        { index: 0, name: "Size" },
        { index: 1, name: "Bust" },
        { index: 2, name: "Length" },
      ],
      values: [
        {
          name: "S",
          measurements: {
            Bust: { inches: "29.92-33.86", centimeters: "76-86" },
            Length: { inches: "11.42", centimeters: "29" },
          },
        },
        {
          name: "M",
          measurements: {
            Bust: {
              inches: "31.50-35.43",
              centimeters: "80-90",
            },
            Length: { inches: "11.81", centimeters: "30" },
          },
        },
        {
          name: "L",
          measurements: {
            Bust: { inches: "33.07-37.01", centimeters: "84-94" },
            Length: { inches: "12.20", centimeters: "31" },
          },
        },
      ],
    },
  },
  seo: {
    metaTitle: "Sexy Backless Tank Top | Summer 2024 Collection",
    metaDescription:
      "Shop our elegant spaghetti strap tank top with sexy backless design. Perfect for summer parties and streetwear. Available in multiple colors and sizes.",
    keywords: [
      "tank top",
      "backless",
      "summer fashion",
      "party wear",
      "streetwear",
      "women's clothing",
    ],
  },
  visibility: "PUBLISHED",
  createdAt: "2024-04-07T08:21:51Z",
  updatedAt: "2024-04-07T08:39:08Z",
  sourceInfo: {
    platform: "AliExpress",
    url: "https://www.aliexpress.us/item/3256805147723941.html",
    storeId: "2415022",
    storeName: "Kayle Clothes Store",
    storeUrl: "www.aliexpress.com/store/1101220990",
  },
};
