import { Banner } from "@/components/website/Banner";
import { Categories } from "@/components/website/Categories";
import { FeaturedProducts } from "@/components/website/FeaturedProducts";
import { getCategories, getCollections, getPageHero } from "@/lib/getData";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const [pageHero, categories, collections] = await Promise.all([
    getPageHero(),
    getCategories(),
    getCollections({ fields: ["title", "slug", "products", "bannerImages"] }),
  ]);

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
          {collections &&
            collections.length > 0 &&
            collections.map((collection, index) => {
              switch (collection.collectionType) {
                case "FEATURED":
                  if (collection.products && collection.products.length >= 3) {
                    return (
                      <div key={index}>
                        <FeaturedProducts
                          collection={collection as CollectionType}
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
    </>
  );
}
