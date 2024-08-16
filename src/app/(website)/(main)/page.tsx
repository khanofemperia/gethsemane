import { Banner } from "@/components/website/Banner";
import { Categories } from "@/components/website/Categories";
import { FeaturedProducts } from "@/components/website/FeaturedProducts";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import {
  getCategories,
  getCollections,
  getPageHero,
  getProductsWithUpsells,
} from "@/lib/getData";
import Image from "next/image";
import Link from "next/link";

type EnrichedProductType = {
  index: number;
  id: string;
  name: string;
  slug: string;
  description: string;
  highlights: {
    headline: string;
    keyPoints: { index: number; text: string }[];
  };
  pricing: {
    salePrice: number;
    basePrice: number;
    discountPercentage: number;
  };
  images: {
    main: string;
    gallery: string[];
  };
  options: {
    colors: Array<{
      name: string;
      image: string;
    }>;
    sizes: {
      inches: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
      centimeters: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
    };
  };
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      salePrice: number;
      basePrice: number;
      discountPercentage: number;
    };
    visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
    createdAt: string;
    updatedAt: string;
    products: {
      id: string;
      name: string;
      slug: string;
      mainImage: string;
      basePrice: number;
    }[];
  };
};

type EnrichedCollectionType = {
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
  products: EnrichedProductType[];
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
};

export default async function Home() {
  const [pageHero, categories, collections] = await Promise.all([
    getPageHero(),
    getCategories(),
    getCollections({ fields: ["title", "slug", "products", "bannerImages"] }),
  ]);

  const getFeaturedCollections = async (): Promise<
    EnrichedCollectionType[]
  > => {
    const featuredCollections = (collections || []).filter(
      (collection) =>
        collection.collectionType === "FEATURED" &&
        collection.visibility === "PUBLISHED"
    );

    const productIdToIndexMap: { id: string; index: number }[] = [];

    featuredCollections.forEach((collection) => {
      if (collection.products) {
        collection.products.forEach((product) => {
          productIdToIndexMap.push({ id: product.id, index: product.index });
        });
      }
    });

    const productIds = productIdToIndexMap.map((item) => item.id);

    const productsFromDb = await getProductsWithUpsells({
      ids: productIds,
      fields: [
        "id",
        "name",
        "slug",
        "description",
        "highlights",
        "pricing",
        "images",
        "options",
        "upsell",
      ],
      visibility: "PUBLISHED",
    });

    const productsWithIndexes = (productsFromDb || []).map((product) => {
      const productIndex = productIdToIndexMap.find(
        (item) => item.id === product.id
      )?.index;
      return { ...product, index: productIndex ?? 0 };
    });

    const collectionsWithProducts = featuredCollections.map((collection) => {
      const enrichedProducts = (collection.products || [])
        .map((product) => {
          const productDetails = productsWithIndexes.find(
            (p) => p.id === product.id
          );
          return productDetails
            ? { ...productDetails, index: product.index }
            : undefined;
        })
        .filter((product) => product !== undefined)
        .sort((a, b) => (a!.index ?? 0) - (b!.index ?? 0));

      return {
        ...collection,
        products: enrichedProducts as Array<{ index: number; id: string }>,
      } as EnrichedCollectionType;
    });

    return collectionsWithProducts;
  };

  const featuredCollections = await getFeaturedCollections();

  const combinedCollections = [
    ...(featuredCollections || []),
    ...(collections?.filter(
      (collection) => collection.collectionType !== "FEATURED"
    ) || []),
  ].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  return (
    <>
      {pageHero && (
        <Link href={pageHero.destinationUrl} target="_blank" className="w-full">
          <div className="block md:hidden">
            <Image
              src={pageHero.images.mobile}
              alt={pageHero.title}
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto",
              }}
              width={2000}
              height={2000}
              priority
            />
          </div>
          <div className="hidden md:block">
            <Image
              src={pageHero.images.desktop}
              alt={pageHero.title}
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto",
              }}
              width={1440}
              height={360}
              priority
            />
          </div>
        </Link>
      )}
      <div className="w-full pt-8">
        {categories && categories.length > 0 && (
          <Categories categories={categories} />
        )}
        <div className="max-w-[968px] mx-auto flex flex-col gap-10">
          {combinedCollections &&
            combinedCollections.length > 0 &&
            combinedCollections.map((collection, index) => {
              switch (collection.collectionType) {
                case "FEATURED":
                  if (collection.products && collection.products.length >= 3) {
                    return (
                      <div key={index}>
                        <FeaturedProducts
                          collection={collection as EnrichedCollectionType}
                        />
                      </div>
                    );
                  }
                  return null;
                case "BANNER":
                  if (collection.products && collection.products.length > 0) {
                    return (
                      <div key={index}>
                        <Banner collection={collection as CollectionType} />
                      </div>
                    );
                  }
                  return null;
                default:
                  return null;
              }
            })}
        </div>
      </div>
      <QuickviewOverlay />
      <UpsellReviewOverlay />
    </>
  );
}
