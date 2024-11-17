"use server";

import { collection, getDocs, query } from "firebase/firestore";
import { database } from "@/lib/firebase";

type ProductWithUpsellType = Partial<Omit<ProductType, "upsell">> & {
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
      basePrice: number;
      images: {
        main: string;
        gallery: string[];
      };
    }[];
  };
};

export async function getOrders(): Promise<OrderType[] | null> {
  const collectionRef = collection(database, "orders");

  const firestoreQuery = query(collectionRef);
  const snapshot = await getDocs(firestoreQuery);

  if (snapshot.empty) {
    return null;
  }

  const orders = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    } as OrderType;
  });

  return orders;
}
