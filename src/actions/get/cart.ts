"use server";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { database } from "@/lib/firebase";
import { revalidatePath } from "next/cache";

export async function getCart(
  deviceIdentifier: string | undefined
): Promise<CartType | null> {
  try {
    if (!deviceIdentifier) {
      return null;
    }

    const collectionRef = collection(database, "carts");
    const snapshot = await getDocs(
      query(collectionRef, where("device_identifier", "==", deviceIdentifier))
    );

    if (snapshot.empty) {
      return null;
    }

    const cartDoc = snapshot.docs[0];
    const cartData = cartDoc.data();

    // Validate and filter cart items
    const validatedItems = await validateCartItems(cartData.items);

    // Update the cart if items were removed
    if (validatedItems.length !== cartData.items.length) {
      const reindexedItems = validatedItems.map((item, index) => ({
        ...item,
        index: index + 1,
      }));

      await runTransaction(database, async (transaction) => {
        transaction.update(cartDoc.ref, {
          items: reindexedItems,
          updatedAt: serverTimestamp(),
        });
      });

      revalidatePath("/cart");
    }

    return {
      id: cartDoc.id,
      device_identifier: cartData.device_identifier,
      items: validatedItems,
    };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

// -- Logic & Utilities --

async function validateCartItems(
  items: (CartProductItemType | CartUpsellItemType)[]
): Promise<(CartProductItemType | CartUpsellItemType)[]> {
  const validatedItems = await Promise.all(
    items.map(async (item) => {
      try {
        if (item.type === "product") {
          const exists = await checkDocumentExists(
            "products",
            item.baseProductId
          );
          return exists ? item : null;
        }

        if (item.type === "upsell") {
          const exists = await checkDocumentExists(
            "upsells",
            item.baseUpsellId
          );
          return exists ? item : null;
        }

        return null;
      } catch {
        return null;
      }
    })
  );

  return validatedItems.filter(
    (item): item is CartProductItemType | CartUpsellItemType => item !== null
  );
}

async function checkDocumentExists(
  collection: "products" | "upsells",
  id: string
): Promise<boolean> {
  if (!id?.trim()) return false;

  const docRef = doc(database, collection, id.trim());
  const snapshot = await getDoc(docRef);
  return snapshot.exists();
}

// -- Type Definitions --

type CartProductItemType = {
  index: number;
  baseProductId: string;
  variantId: string;
  color: string;
  size: string;
  type: "product";
};

type CartUpsellItemType = {
  index: number;
  baseUpsellId: string;
  variantId: string;
  type: "upsell";
  products: Array<{
    id: string;
    color: string;
    size: string;
  }>;
};

type CartType = {
  id: string;
  device_identifier: any;
  items: (CartProductItemType | CartUpsellItemType)[];
};
