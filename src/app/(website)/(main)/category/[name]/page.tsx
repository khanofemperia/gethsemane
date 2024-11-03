import { ProductCard } from "@/components/website/ProductCard";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import ShowAlert from "@/components/website/ShowAlert";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { getCart } from "@/lib/api/cart";
import { cookies } from "next/headers";
import Link from "next/link";
import clsx from "clsx";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { database } from "@/lib/firebase";
import { capitalizeFirstLetter } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";

export default async function Categories({
  params,
  searchParams,
}: {
  params: { name: string };
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 2; // 12 Products per page

  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";
  const cart = await getCart(deviceIdentifier);

  const { products, totalPages } = await getProducts({
    category: params.name,
    page,
    limit,
  });

  return (
    <>
      <div className="max-w-[968px] mx-auto pt-10">
        {products && Array.isArray(products) && (
          <>
            <div className="select-none w-full flex flex-wrap gap-1 md:gap-0">
              {products
                .filter(
                  (product): product is ProductWithUpsellType =>
                    product !== null
                )
                .map((product, index) => (
                  <ProductCard
                    key={index}
                    product={product}
                    cart={cart}
                    deviceIdentifier={deviceIdentifier}
                  />
                ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 mb-12">
                <div className="w-max mx-auto flex gap-1 h-9">
                  <Link
                    href={`/category/${params.name}?page=${page - 1}`}
                    className={clsx(
                      "w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition",
                      {
                        "pointer-events-none opacity-50": page === 1,
                        "active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed":
                          page !== 1,
                      }
                    )}
                  >
                    <ChevronLeftIcon className="-ml-[2px]" size={24} />
                  </Link>

                  <div className="min-w-[36px] max-w-[36px] h-9 px-1 flex items-center justify-center border rounded-full bg-white">
                    {page}
                  </div>

                  <div className="flex items-center justify-center px-1">
                    of
                  </div>

                  <div className="min-w-[36px] max-w-[36px] h-9 px-1 flex items-center justify-center border rounded-full bg-white">
                    {totalPages}
                  </div>

                  <Link
                    href={`/category/${params.name}?page=${page + 1}`}
                    className={clsx(
                      "w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition",
                      {
                        "pointer-events-none opacity-50": page === totalPages,
                        "active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed":
                          page !== totalPages,
                      }
                    )}
                  >
                    <ChevronRightIcon className="-mr-[2px]" size={24} />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <QuickviewOverlay />
      <UpsellReviewOverlay cart={cart} />
      <ShowAlert />
    </>
  );
}

async function getProducts({
  category,
  page = 1,
  limit: pageLimit = 12,
}: {
  category: string;
  page?: number;
  limit?: number;
}): Promise<{
  products: (ProductType | ProductWithUpsellType)[];
  totalPages: number;
  lastVisible: any | null;
}> {
  try {
    const productsRef = collection(database, "products");
    const countQuery = query(
      productsRef,
      where("category", "==", capitalizeFirstLetter(category))
    );
    const countSnapshot = await getDocs(countQuery);
    const totalProducts = countSnapshot.size;
    const totalPages = Math.ceil(totalProducts / pageLimit);

    let paginatedQuery = query(
      productsRef,
      where("category", "==", capitalizeFirstLetter(category)),
      orderBy("updatedAt", "desc"),
      orderBy("__name__", "desc"),
      limit(pageLimit)
    );

    // If not the first page, we need to get the cursor
    if (page > 1) {
      const cursorDocQuery = query(
        productsRef,
        where("category", "==", capitalizeFirstLetter(category)),
        orderBy("updatedAt", "desc"),
        orderBy("__name__", "desc"),
        limit((page - 1) * pageLimit)
      );

      const cursorSnapshot = await getDocs(cursorDocQuery);

      if (!cursorSnapshot.empty) {
        const lastDoc = cursorSnapshot.docs[cursorSnapshot.docs.length - 1];

        paginatedQuery = query(
          productsRef,
          where("category", "==", capitalizeFirstLetter(category)),
          orderBy("updatedAt", "desc"),
          orderBy("__name__", "desc"),
          startAfter(lastDoc),
          limit(pageLimit)
        );
      }
    }

    // Get the paginated products
    const paginatedSnapshot = await getDocs(paginatedQuery);
    const lastVisible =
      paginatedSnapshot.docs[paginatedSnapshot.docs.length - 1];

    const products = await Promise.all(
      paginatedSnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();

        const product: Partial<ProductType> = {
          id: docSnapshot.id,
          ...data,
        };

        if (product?.upsell) {
          const upsellDetails = await fetchUpsellDetails(product.upsell);
          if (upsellDetails) {
            return {
              ...product,
              upsell: upsellDetails,
            } as ProductWithUpsellType;
          }
        }

        return product as ProductType;
      })
    );

    return {
      products,
      totalPages,
      lastVisible,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("requires an index")) {
      console.error("Firestore index not yet ready:", error);
      // Return empty state while index is building
      return {
        products: [],
        totalPages: 0,
        lastVisible: null,
      };
    }
    throw error;
  }
}

async function fetchUpsellDetails(
  upsellId: string
): Promise<UpsellType | null> {
  const upsellDocRef = doc(database, "upsells", upsellId);
  const upsellSnapshot = await getDoc(upsellDocRef);

  if (!upsellSnapshot.exists()) {
    return null;
  }

  const upsellData = upsellSnapshot.data() as UpsellType;
  const productsInUpsell = await Promise.all(
    upsellData.products.map(async (productItem) => {
      const productDocRef = doc(database, "products", productItem.id);
      const productSnapshot = await getDoc(productDocRef);

      if (!productSnapshot.exists()) {
        return null;
      }

      const productData = productSnapshot.data() as ProductType;
      return {
        index: productItem.index,
        name: productItem.name,
        id: productData.id,
        slug: productData.slug,
        images: productData.images,
        basePrice: productData.pricing.basePrice,
        options: productData.options,
      };
    })
  );

  return {
    ...upsellData,
    products: productsInUpsell.filter(
      (item): item is UpsellType["products"][number] => item !== null
    ),
  };
}
