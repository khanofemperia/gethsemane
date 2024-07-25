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
import {
  DescriptionButton,
  DescriptionOverlay,
} from "@/components/admin/EditProduct/DescriptionOverlay";
import { getProduct } from "@/lib/getData";
import Link from "next/link";
import { CheckmarkIcon } from "@/icons";
import {
  OnPageSeoButton,
  OnPageSeoOverlay,
} from "@/components/admin/EditProduct/OnPageSeoOverlay";
import {
  ProductSourceButton,
  ProductSourceOverlay,
} from "@/components/admin/EditProduct/ProductSourceOverlay";
import {
  HighlightsButton,
  HighlightsOverlay,
} from "@/components/admin/EditProduct/HighlightsOverlay";
import clsx from "clsx";

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
    highlights,
    sourceInfo,
    seo,
    visibility,
  } = product as ProductType;

  const hasBasicDetails = category && name && pricing.basePrice && slug && id;
  const hasOnPageSeo =
    seo.metaTitle && seo.metaDescription && seo.keywords.length;
  const hasSourceInfo =
    sourceInfo.platform &&
    sourceInfo.platformUrl &&
    sourceInfo.store &&
    sourceInfo.storeId &&
    sourceInfo.storeUrl &&
    sourceInfo.productUrl;

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
          <div
            className={clsx(
              "w-full relative flex items-center justify-between shadow rounded-xl bg-white",
              {
                "p-5 pr-2": !hasBasicDetails,
              }
            )}
          >
            {hasBasicDetails ? (
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
                  {Number(pricing.salePrice) ? (
                    <div className="flex items-center gap-[6px]">
                      <span className="font-medium">
                        ${formatThousands(Number(pricing.salePrice))}
                      </span>
                      <span className="text-xs text-gray line-through mt-[2px]">
                        ${formatThousands(Number(pricing.basePrice))}
                      </span>
                      <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-3 py-1 px-[5px]">
                        -{pricing.discountPercentage}%
                      </span>
                    </div>
                  ) : (
                    <p className="font-medium">
                      ${formatThousands(Number(pricing.basePrice))}
                    </p>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Slug</h3>
                  <p className="font-medium">
                    {slug}-{id}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <BasicDetailsButton
              className={clsx({
                "absolute top-2 right-2": hasBasicDetails,
              })}
            />
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
              <div className="relative border rounded-xl">
                <div>
                  {!images.main || !isValidRemoteImage(images.main) ? (
                    <div className="w-full flex items-center justify-between p-5 pr-2">
                      <span className="text-xs text-gray">No main image</span>
                      <MainImageButton />
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between pl-5 pr-2 py-2">
                      <span className="text-xs text-gray">Main</span>
                      <MainImageButton />
                    </div>
                  )}
                </div>
                <div>
                  {images.main && isValidRemoteImage(images.main) && (
                    <div className="p-5 pt-0">
                      <div className="w-full max-w-[280px] rounded-xl aspect-square flex items-center justify-center overflow-hidden">
                        <Image
                          src={images.main}
                          alt={name}
                          width={280}
                          height={280}
                          priority
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative border rounded-xl">
                <div>
                  {images.gallery.length === 0 ||
                  images.gallery.every(
                    (image) => !isValidRemoteImage(image)
                  ) ? (
                    <div className="w-full flex items-center justify-between p-5 pr-2">
                      <span className="text-xs text-gray">No gallery</span>
                      <ImagesButton />
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between pl-5 pr-2 py-2">
                      <span className="text-xs text-gray">Gallery</span>
                      <ImagesButton />
                    </div>
                  )}
                </div>
                <div>
                  {images.gallery.length > 0 &&
                    images.gallery.every((image) =>
                      isValidRemoteImage(image)
                    ) && (
                      <div className="flex flex-wrap gap-2 p-5 pt-0">
                        {images.gallery.map(
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
                        )}
                      </div>
                    )}
                </div>
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
            <div className="flex flex-col gap-5 p-5">
              <div className="relative border rounded-xl">
                <div>
                  {options.sizes.inches.rows.length === 0 ? (
                    <div className="w-full flex items-center justify-between p-5 pr-2">
                      <span className="text-xs text-gray">No sizes</span>
                      <SizeChartButton />
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between pl-5 pr-2 py-2">
                      <span className="text-xs text-gray">Sizes</span>
                      <SizeChartButton />
                    </div>
                  )}
                </div>
                <div>
                  {(() => {
                    if (
                      options.sizes.inches.columns &&
                      options.sizes.inches.rows
                    ) {
                      const firstColumnLabel =
                        options.sizes.inches.columns.find(
                          (column) => column.order === 1
                        )?.label;

                      return (
                        <div className="flex flex-wrap gap-2 p-5 pt-0">
                          {options.sizes.inches.rows.map((row, index) => (
                            <div
                              key={index}
                              className="min-w-12 w-max h-7 px-4 text-sm font-medium select-none rounded-full bg-lightgray flex items-center justify-center"
                            >
                              {firstColumnLabel && row[firstColumnLabel]}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              <div className="relative border rounded-xl">
                <div>
                  {options.colors.length === 0 ||
                  !options.colors.some((color) =>
                    isValidRemoteImage(color.image)
                  ) ? (
                    <div className="w-full flex items-center justify-between p-5 pr-2">
                      <span className="text-xs text-gray">No colors</span>
                      <ColorsButton />
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between pl-5 pr-2 py-2">
                      <span className="text-xs text-gray">Colors</span>
                      <ColorsButton />
                    </div>
                  )}
                </div>
                <div>
                  {options.colors.length > 0 &&
                    options.colors.some((color) =>
                      isValidRemoteImage(color.image)
                    ) && (
                      <div className="flex flex-wrap gap-2 p-5 pt-0">
                        {options.colors.map(
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
                                  <div className="w-max max-w-full px-3 font-medium flex items-center text-sm text-nowrap overflow-x-visible overflow-y-hidden invisible-scrollbar">
                                    {color.name}
                                  </div>
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Product description</h2>
            <p className="text-sm md:max-w-[85%]">
              Spotlight your product's strengths. What makes it the
              life-changing choice customers can't resist? Why is it the clear
              winner? Keep it simple and unforgettable.
            </p>
          </div>
          <div className="w-full relative shadow rounded-xl bg-white">
            {!description ? (
              <div className="w-full flex items-center justify-between p-5 pr-2">
                <span className="text-xs text-gray">Nothing here</span>
                <DescriptionButton />
              </div>
            ) : (
              <div className="w-full relative border rounded-xl p-5 flex items-center justify-between">
                <div className="w-[calc(100%-60px)] mt-1 border rounded-2xl p-5">
                  <div
                    className="line-clamp-3 [&>:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </div>
                <DescriptionButton className="absolute top-2 right-2" />
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Highlights</h2>
            <p className="text-sm md:max-w-[85%]">
              Craft an irresistible message. Hook them with pain. Show you
              understand their struggles. Alternatively, tap into their desires
              and create a sense of possibility. Use active voice, strong verbs.
              Paint a clear picture of the desired outcome. Make them feel the
              satisfaction, see the results, crave your solution.
            </p>
          </div>
          <div className="w-full relative shadow rounded-xl bg-white">
            {!(highlights.headline && highlights.keyPoints.length > 0) ? (
              <div className="w-full flex items-center justify-between p-5 pr-2">
                <span className="text-xs text-gray">Nothing here</span>
                <HighlightsButton />
              </div>
            ) : (
              <>
                <div className="w-[calc(100%-60px)] p-5 pt-4">
                  <div>
                    <div
                      className="line-clamp-3 [&>:last-child]:mb-0"
                      dangerouslySetInnerHTML={{
                        __html: highlights.headline || "",
                      }}
                    />
                  </div>
                  <ul className="mt-5 pb-2 text-sms list-inside *:leading-[25px]">
                    {highlights.keyPoints
                      .slice()
                      .sort((a, b) => a.index - b.index)
                      .map((highlight) => (
                        <li
                          key={highlight.index}
                          className="flex items-start gap-2 mb-2 last:mb-0"
                        >
                          <div className="w-5 min-w-5 h-5 -ml-[1px] flex items-center justify-center">
                            <CheckmarkIcon
                              className="fill-green mt-[3px] -ml-[1px]"
                              size={19}
                            />
                          </div>
                          <span>{highlight.text}</span>
                        </li>
                      ))}
                  </ul>
                </div>
                <HighlightsButton className="absolute top-2 right-2" />
              </>
            )}
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">On-page SEO</h2>
            <p className="text-sm md:max-w-[85%]">
              Integrate relevant keywords into the product details page to
              improve on-page SEO. This ensures the content aligns with search
              queries and helps search engines know what the page is about.
            </p>
          </div>
          <div
            className={clsx(
              "w-full relative flex items-center justify-between shadow rounded-xl bg-white",
              {
                "p-5 pr-2": !hasOnPageSeo,
              }
            )}
          >
            {hasOnPageSeo ? (
              <div className="w-[calc(100%-60px)]">
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Meta title</h3>
                  <p className="font-medium">{seo.metaTitle}</p>
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Meta description</h3>
                  <p className="font-medium max-w-[540px]">
                    {seo.metaDescription}
                  </p>
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Keywords</h3>
                  <p className="font-medium">{seo.keywords.join(", ")}</p>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <OnPageSeoButton
              className={clsx({
                "absolute top-2 right-2": hasOnPageSeo,
              })}
            />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Product source</h2>
            <p className="text-sm md:max-w-[85%]">
              Keep track of your suppliers! This helps with quality control,
              fast reorders, and quicker problem resolution.
            </p>
          </div>
          <div
            className={clsx(
              "w-full relative flex items-center justify-between shadow rounded-xl bg-white",
              {
                "p-5 pr-2": !hasSourceInfo,
              }
            )}
          >
            {hasSourceInfo ? (
              <div className="w-[calc(100%-60px)]">
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Platform</h3>
                  <Link
                    href={sourceInfo.platformUrl}
                    target="_blank"
                    className="font-medium text-blue active:underline hover:underline"
                  >
                    {sourceInfo.platform}
                  </Link>
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Store</h3>
                  <Link
                    href={sourceInfo.storeUrl}
                    target="_blank"
                    className="font-medium text-blue active:underline hover:underline"
                  >
                    {sourceInfo.store} ({sourceInfo.storeId})
                  </Link>
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Product</h3>
                  <Link
                    href={sourceInfo.productUrl}
                    target="_blank"
                    className="font-medium text-blue active:underline hover:underline"
                  >
                    View on {sourceInfo.platform}
                  </Link>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <ProductSourceButton
              className={clsx({
                "absolute top-2 right-2": hasSourceInfo,
              })}
            />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Visibility</h2>
            <p className="text-sm md:max-w-[85%]">
              Choose whether the product is a work-in-progress (draft) or ready
              to be seen (published), and decide if you want shoppers to see it
              or keep it private (hidden).
            </p>
          </div>
          <div className="w-full max-w-[400px] relative shadow rounded-xl bg-white">
            <div className="relative border rounded-xl pl-5 pr-[10px] py-4">
              <div className="w-full flex items-center justify-between">
                <DataChip value={visibility as VisibilityType} />
                <VisibilityButton />
              </div>
            </div>
          </div>
        </div>
      </div>
      <BasicDetailsOverlay data={{ id, category, name, slug, pricing }} />
      <OnPageSeoOverlay data={{ id, seo }} />
      <ProductSourceOverlay data={{ id, sourceInfo }} />
      <MainImageOverlay data={{ id, images }} />
      <ImagesOverlay data={{ id, images }} />
      <ColorsOverlay data={{ id, colors: options.colors }} />
      <SizeChartOverlay
        data={{
          id,
          sizes: options.sizes,
        }}
      />
      <DescriptionOverlay data={{ id, description }} />
      <HighlightsOverlay data={{ id, highlights }} />
      <VisibilityOverlay data={{ id, visibility }} />
    </>
  );
}
