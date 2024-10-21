import React from "react";
import { cookies } from "next/headers";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { getCart } from "@/lib/getData";
import { database } from "@/lib/firebase";
import { ProductCard } from "@/components/website/ProductCard";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import ShowAlert from "@/components/website/ShowAlert";

export default async function NewArrivals() {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";
  const cart = await getCart(deviceIdentifier);
  const products = await getProductsWithUpsells();

  return (
    <>
      <div className="max-w-[968px] mx-auto pt-10">
        <div className="select-none w-full flex flex-wrap gap-1 md:gap-0">
          {products?.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              cart={cart}
              deviceIdentifier={deviceIdentifier}
            />
          ))}
        </div>
      </div>
      <QuickviewOverlay />
      <UpsellReviewOverlay cart={cart} />
      <ShowAlert />
    </>
  );
}

async function getProductsWithUpsells(): Promise<
  ProductWithUpsellType[] | null
> {
  const collectionRef = collection(database, "products");
  const snapshot = await getDocs(query(collectionRef));

  if (snapshot.empty) {
    return null;
  }

  const products = await Promise.all(
    snapshot.docs.map(
      async (docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
        const data = docSnapshot.data() as Omit<ProductType, "id">;
        const product: ProductType = {
          ...data,
          id: docSnapshot.id,
        };

        let upsell: UpsellType | null = null;
        if (product.upsell && product.upsell.trim()) {
          const upsellDocRef = doc(database, "upsells", product.upsell);
          const upsellSnapshot = await getDoc(upsellDocRef);

          if (upsellSnapshot.exists()) {
            upsell = upsellSnapshot.data() as UpsellType;
          }
        }

        return {
          ...product,
          upsell,
        } as ProductWithUpsellType;
      }
    )
  );

  return products.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
