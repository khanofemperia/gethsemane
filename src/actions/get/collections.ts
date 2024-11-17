"use server";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { database } from "@/lib/firebase";

/**
 * Unified function to get collections with flexible filtering and field selection.
 *
 * @example Get a single collection
 * const collection = await getCollections({ ids: ["collection-id"] });
 *
 * @example Get multiple collections with specific fields
 * const collections = await getCollections({
 *   ids: ["id1", "id2"],
 *   fields: ["title", "description"]
 * });
 *
 * @example Get all published collections with products and their upsells
 * const collections = await getCollections({
 *   visibility: "PUBLISHED",
 *   includeProducts: true
 * });
 */
export async function getCollections(
  options: GetCollectionsOptionsType = {}
): Promise<CollectionType[] | null> {
  const { ids = [], fields = [], visibility, includeProducts } = options;

  const collectionsRef = collection(database, "collections");
  let conditions: any[] = [];

  if (ids.length > 0) {
    conditions.push(where("__name__", "in", ids));
  }
  if (visibility) {
    conditions.push(where("visibility", "==", visibility));
  }

  const firestoreQuery =
    conditions.length > 0
      ? query(collectionsRef, ...conditions)
      : query(collectionsRef);

  const snapshot = await getDocs(firestoreQuery);

  if (snapshot.empty) {
    return null;
  }

  const collections = await Promise.all(
    snapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();
      let selectedFields: Partial<CollectionType> = {};

      if (fields.length) {
        fields.forEach((field) => {
          if (data.hasOwnProperty(field)) {
            selectedFields[field as keyof CollectionType] = data[field];
          }
        });
      } else {
        selectedFields = data;
      }

      const collection = {
        id: docSnapshot.id,
        ...selectedFields,
        ...(data.collectionType === "BANNER" &&
          data.bannerImages && {
            bannerImages: data.bannerImages,
          }),
        updatedAt: data["updatedAt"],
        index: data["index"],
        visibility: data["visibility"],
        collectionType: data["collectionType"],
      };

      if (includeProducts && data.products?.length) {
        const productIds = data.products.map((p: { id: string }) => p.id);
        const products = await getProducts({
          ids: productIds,
          fields: [
            "name",
            "slug",
            "description",
            "highlights",
            "pricing",
            "images",
            "options",
            "upsell",
          ],
        });

        if (products) {
          const productsWithIndex = products.map((product) => {
            const productIndex =
              data.products.find((p: { id: string }) => p.id === product.id)
                ?.index ?? 0;
            return { ...product, index: productIndex };
          });

          return {
            ...collection,
            products: productsWithIndex,
          };
        }
      }

      return collection as CollectionType;
    })
  );

  return collections.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
}

// -- Logic & Utilities --

async function getProducts(options: {
  ids: string[];
  fields: string[];
}): Promise<(ProductType | ProductWithUpsellType)[] | null> {
  const { ids, fields } = options;

  // Build the base query
  const productsRef = collection(database, "products");
  let conditions: any[] = [];

  if (ids.length > 0) {
    conditions.push(where("__name__", "in", ids));
  }

  const firestoreQuery =
    conditions.length > 0
      ? query(productsRef, ...conditions)
      : query(productsRef);

  const snapshot = await getDocs(firestoreQuery);

  if (snapshot.empty) {
    return null;
  }

  // Process products
  const products = await Promise.all(
    snapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();
      let selectedFields: Partial<ProductType> = {};

      if (fields.length) {
        fields.forEach((field) => {
          if (data.hasOwnProperty(field)) {
            selectedFields[field as keyof ProductType] = data[field];
          }
        });
      } else {
        selectedFields = data;
      }

      const product = {
        id: docSnapshot.id,
        ...selectedFields,
        updatedAt: data.updatedAt,
        visibility: data.visibility,
      };

      // Fetch upsell details if requested and available
      if (
        product.upsell &&
        typeof product.upsell === "string" &&
        product.upsell.trim()
      ) {
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

  return products.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
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

// -- Type Definitions --

type GetCollectionsOptionsType = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  includeProducts?: boolean;
};
