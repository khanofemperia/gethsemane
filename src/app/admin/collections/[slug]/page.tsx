import DataChip from "@/ui/DataChip";
import { formatThousands, isValidRemoteImage } from "@/lib/utils/common";
import { notFound } from "next/navigation";
import {
  VisibilityButton,
  VisibilityOverlay,
} from "@/components/admin/Storefront/EditCollection/VisibilityOverlay";
import { HiOutlineBan, HiOutlineClock } from "react-icons/hi";
import { IoHourglassOutline } from "react-icons/io5";
import clsx from "clsx";
import { ChevronRightIcon } from "@/icons";
import {
  CampaignDurationButton,
  CampaignDurationOverlay,
} from "@/components/admin/Storefront/EditCollection/CampaignDurationOverlay";
import {
  BasicDetailsButton,
  BasicDetailsOverlay,
} from "@/components/admin/Storefront/EditCollection/BasicDetailsOverlay";
import Link from "next/link";
import Image from "next/image";
import {
  ProductListButton,
  ProductListOverlay,
} from "@/components/admin/Storefront/EditCollection/ProductListOverlay";
import {
  BannerImagesButton,
  BannerImagesOverlay,
} from "@/components/admin/Storefront/EditCollection/BannerImagesOverlay";
import { getCollections } from "@/lib/api/collections";
import { getProducts } from "@/lib/api/products";

export default async function EditCollection({
  params,
}: {
  params: { slug: string };
}) {
  const CAMPAIGN_STATUS_ENDED = "Ended";
  const CAMPAIGN_STATUS_UPCOMING = "Upcoming";
  const CAMPAIGN_STATUS_ACTIVE = "Active";

  const [collection] =
    (await getCollections({
      ids: [params.slug.split("-").pop() as string],
      includeProducts: true,
    })) || [];

  if (!collection) {
    notFound();
  }

  const productIndexes = new Map(
    (collection.products || []).map((product) => [product.id, product.index])
  );

  const collectionProducts = await getProducts({
    ids: Array.from(productIndexes.keys()),
    fields: ["id", "slug", "images", "name", "pricing"],
  });

  const sortedProducts = (collectionProducts || [])
    .map((product) => ({
      ...product,
      index: productIndexes.get(product.id) ?? 0,
    }))
    .sort((a, b) => a.index - b.index);

  const updatedCollection = {
    ...collection,
    products: sortedProducts,
  };

  const {
    id,
    campaignDuration,
    collectionType,
    title,
    slug,
    bannerImages,
    visibility,
    products,
  } = updatedCollection as CollectionDataType;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getCampaignStatus = (startDate: string, endDate: string): string => {
    const currentDate = new Date();
    const campaignStartDate = new Date(startDate);
    const campaignEndDate = new Date(endDate);

    campaignStartDate.setUTCHours(0, 0, 0, 0);
    campaignEndDate.setUTCHours(0, 0, 0, 0);

    if (currentDate.getTime() > campaignEndDate.getTime()) {
      return CAMPAIGN_STATUS_ENDED;
    } else if (currentDate.getTime() < campaignStartDate.getTime()) {
      return CAMPAIGN_STATUS_UPCOMING;
    } else {
      return CAMPAIGN_STATUS_ACTIVE;
    }
  };

  const hasBasicDetails = title && collectionType && slug && id;

  return (
    <>
      <div className="max-w-[768px] flex flex-col gap-10 px-5">
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Campaign duration</h2>
            <p className="text-sm md:max-w-[85%]">
              Keep track of your campaign. Upcoming, Active, or Ended. This
              helps you plan your marketing effectively and make adjustments as
              needed for maximum impact.
            </p>
          </div>
          <div className="w-full max-w-[400px] relative p-5 pr-2 flex items-center justify-between shadow rounded-xl bg-white">
            {Object.keys(campaignDuration || {}).length > 0 ? (
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  {getCampaignStatus(
                    campaignDuration.startDate,
                    campaignDuration.endDate
                  ) === CAMPAIGN_STATUS_UPCOMING && (
                    <IoHourglassOutline
                      className="stroke-gold fill-gold"
                      size={18}
                    />
                  )}
                  {getCampaignStatus(
                    campaignDuration.startDate,
                    campaignDuration.endDate
                  ) === CAMPAIGN_STATUS_ACTIVE && (
                    <HiOutlineClock className="stroke-green" size={18} />
                  )}
                  {getCampaignStatus(
                    campaignDuration.startDate,
                    campaignDuration.endDate
                  ) === CAMPAIGN_STATUS_ENDED && (
                    <HiOutlineBan className="stroke-red" size={18} />
                  )}
                  <span
                    className={clsx("italic", {
                      "text-gold":
                        getCampaignStatus(
                          campaignDuration.startDate,
                          campaignDuration.endDate
                        ) === CAMPAIGN_STATUS_UPCOMING,
                      "text-green":
                        getCampaignStatus(
                          campaignDuration.startDate,
                          campaignDuration.endDate
                        ) === CAMPAIGN_STATUS_ACTIVE,
                      "text-red":
                        getCampaignStatus(
                          campaignDuration.startDate,
                          campaignDuration.endDate
                        ) === CAMPAIGN_STATUS_ENDED,
                    })}
                  >
                    {getCampaignStatus(
                      campaignDuration.startDate,
                      campaignDuration.endDate
                    )}
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-1 h-max">
                  <div className="flex gap-2 items-center">
                    <div
                      className={clsx(
                        "px-3 rounded-full h-6 w-max flex gap-1 items-center",
                        {
                          "bg-green/10 border border-green/15":
                            getCampaignStatus(
                              campaignDuration.startDate,
                              campaignDuration.endDate
                            ) === CAMPAIGN_STATUS_ACTIVE,
                          "bg-lightgray border border-[#6c6c6c]/15":
                            getCampaignStatus(
                              campaignDuration.startDate,
                              campaignDuration.endDate
                            ) === CAMPAIGN_STATUS_ENDED ||
                            getCampaignStatus(
                              campaignDuration.startDate,
                              campaignDuration.endDate
                            ) === CAMPAIGN_STATUS_UPCOMING,
                        }
                      )}
                    >
                      <span className="text-gray">Launch</span>
                      <ChevronRightIcon className="stroke-gray" size={16} />
                      <span
                        className={clsx({
                          "text-green":
                            getCampaignStatus(
                              campaignDuration.startDate,
                              campaignDuration.endDate
                            ) === CAMPAIGN_STATUS_ACTIVE,
                        })}
                      >
                        {formatDate(campaignDuration.startDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div
                      className={clsx(
                        "px-3 rounded-full h-6 w-max flex gap-1 items-center",
                        {
                          "bg-red/10 border border-red/15":
                            getCampaignStatus(
                              campaignDuration.startDate,
                              campaignDuration.endDate
                            ) === CAMPAIGN_STATUS_ENDED,
                          "bg-lightgray border border-[#6c6c6c]/15":
                            getCampaignStatus(
                              campaignDuration.startDate,
                              campaignDuration.endDate
                            ) === CAMPAIGN_STATUS_ACTIVE ||
                            getCampaignStatus(
                              campaignDuration.startDate,
                              campaignDuration.endDate
                            ) === CAMPAIGN_STATUS_UPCOMING,
                        }
                      )}
                    >
                      <span className="text-gray">End date</span>
                      <ChevronRightIcon className="stroke-gray" size={16} />
                      <span
                        className={clsx({
                          "text-red":
                            getCampaignStatus(
                              campaignDuration.startDate,
                              campaignDuration.endDate
                            ) === CAMPAIGN_STATUS_ENDED,
                        })}
                      >
                        {formatDate(campaignDuration.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <CampaignDurationButton
              className={clsx({
                "absolute top-2 right-2":
                  Object.keys(campaignDuration || {}).length > 0,
              })}
            />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Basic details</h2>
            <p className="text-sm md:max-w-[85%]">
              Create a title that sticks in people's minds. Make it enticing
              enough to make them stop and pay attention. Finally, reinforce it
              with a short, keyword-rich slug (3-5 words).
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
                  <h3 className="text-xs text-gray mb-2">Collection</h3>
                  <p className="font-medium text-sm">{collectionType}</p>
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Title</h3>
                  <p className="font-medium max-w-[540px]">{title}</p>
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
        {bannerImages &&
          bannerImages.desktopImage &&
          bannerImages.mobileImage && (
            <div>
              <div className="mb-6">
                <h2 className="font-semibold text-xl mb-3">Banner images</h2>
                <p className="text-sm md:max-w-[85%]">
                  Create a banner that demands attention. Bold imagery and a
                  strong call-to-action can turn passive viewers into active
                  customers.
                </p>
              </div>
              <div className="w-full relative p-5 pr-2 flex items-center justify-between shadow rounded-xl bg-white">
                <div className="w-[calc(100%-60px)] flex flex-col gap-8">
                  <div>
                    <h3 className="text-xs text-gray mb-4">
                      Desktop (1440x360 px)
                    </h3>
                    <div className="w-full rounded-xl flex items-center justify-center overflow-hidden">
                      {isValidRemoteImage(bannerImages?.desktopImage) && (
                        <Image
                          src={bannerImages?.desktopImage}
                          alt={title}
                          width={766}
                          height={308}
                          priority={true}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs text-gray mb-4">
                      Mobile (1080x1080 px)
                    </h3>
                    <div className="w-full max-w-[416px] aspect-square rounded-xl flex items-center justify-center overflow-hidden">
                      {isValidRemoteImage(bannerImages?.mobileImage) && (
                        <Image
                          src={bannerImages?.mobileImage}
                          alt={title}
                          width={766}
                          height={308}
                          priority={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <BannerImagesButton
                  className={clsx({
                    "absolute top-2 right-2": true,
                  })}
                />
              </div>
            </div>
          )}
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Products</h2>
            <p className="text-sm md:max-w-[85%]">
              Pick stuff that goes well together. Choose different looks,
              colors, and prices. Make sure there's something for everyone.
            </p>
          </div>
          <div className="w-full relative p-5 pr-2 flex items-center justify-between shadow rounded-xl bg-white">
            {products.length > 0 ? (
              <div className="w-[calc(100%-60px)] flex flex-wrap gap-5 justify-start">
                {products.map(({ id, pricing, images }, index) => (
                  <Link
                    key={index}
                    href={`/admin/shop/upsells/${id}`}
                    target="_blank"
                    className="group aspect-square w-[calc(33.33%-14px)] select-none"
                  >
                    <div className="relative">
                      <div className="w-full aspect-square overflow-hidden flex items-center justify-center shadow-[2px_2px_4px_#9E9E9E] bg-white">
                        <Image
                          src={images.main}
                          alt="Upsell"
                          width={250}
                          height={250}
                          priority
                        />
                      </div>
                      <div className="w-full h-full absolute top-0 bottom-0 left-0 right-0 ease-in-out duration-300 transition group-hover:bg-black/20"></div>
                    </div>
                    <div className="mt-2 w-max mx-auto flex items-center justify-center">
                      {Number(pricing.salePrice) ? (
                        <div className="flex items-center gap-[6px]">
                          <div className="flex items-baseline">
                            <span className="text-[0.813rem] leading-3 font-semibold">
                              $
                            </span>
                            <span className="text-lg font-bold">
                              {Math.floor(Number(pricing.salePrice))}
                            </span>
                            <span className="text-[0.813rem] leading-3 font-semibold">
                              {(Number(pricing.salePrice) % 1)
                                .toFixed(2)
                                .substring(1)}
                            </span>
                          </div>
                          <span className="text-[0.813rem] leading-3 text-gray line-through">
                            ${formatThousands(Number(pricing.basePrice))}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline">
                          <span className="text-[0.813rem] leading-3 font-semibold">
                            $
                          </span>
                          <span className="text-lg font-bold">
                            {Math.floor(Number(pricing.basePrice))}
                          </span>
                          <span className="text-[0.813rem] leading-3 font-semibold">
                            {(Number(pricing.basePrice) % 1)
                              .toFixed(2)
                              .substring(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <ProductListButton
              className={clsx({
                "absolute top-2 right-2": products.length > 0,
              })}
            />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Visibility</h2>
            <p className="text-sm md:max-w-[85%]">
              Published or hidden? Choose if your creation is visible on the
              public website.
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
      <CampaignDurationOverlay data={{ id, campaignDuration }} />
      <BasicDetailsOverlay data={{ id, title, slug, collectionType }} />
      {bannerImages && <BannerImagesOverlay data={{ id, bannerImages }} />}
      <VisibilityOverlay data={{ id, visibility }} />
      <ProductListOverlay data={{ id, products }} />
    </>
  );
}

// -- Type Definitions --

type ProductWithIndex = ProductType & { index: number };

type CollectionDataType = {
  id: string;
  bannerImages?: {
    desktopImage: string;
    mobileImage: string;
  };
  title: string;
  slug: string;
  campaignDuration: {
    startDate: string;
    endDate: string;
  };
  visibility: string;
  collectionType: string;
  index: number;
  updatedAt: string;
  createdAt: string;
  products: ProductWithIndex[];
};
