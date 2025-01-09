"use server";

import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { database } from "@/lib/firebase";

const BATCH_SIZE = 10; // Firestore limitation for 'in' queries

/**
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
    conditions.push(where(documentId(), "in", ids));
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

  // Extract collections and gather all product IDs
  const collections: CollectionType[] = [];
  const allProductIds = new Set<string>();

  snapshot.docs.forEach((docSnapshot) => {
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
      data.products.forEach((product: { id: string }) => {
        allProductIds.add(product.id);
      });
    }

    collections.push(collection as CollectionType);
  });

  // If we need to include products and have product IDs, fetch them
  if (includeProducts && allProductIds.size > 0) {
    const productsMap = await fetchProductsInBatches(Array.from(allProductIds));

    // Enhance collections with their products
    const enhancedCollections = collections.map((collection) => {
      const collectionData = snapshot.docs.find((doc) => doc.id === collection.id)?.data();
      
      if (!collectionData?.products?.length) {
        return collection;
      }

      const collectionProducts = collectionData.products
        .map((productRef: { id: string; index: number }) => {
          const productData = productsMap.get(productRef.id);
          return productData
            ? { ...productData, index: productRef.index }
            : null;
        })
        .filter(Boolean);

      return {
        ...collection,
        products: collectionProducts,
      };
    });

    return enhancedCollections.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  }

  return collections.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
}

async function fetchProductsInBatches(
  productIds: string[]
): Promise<Map<string, ProductType | ProductWithUpsellType>> {
  const productsMap = new Map<string, ProductType | ProductWithUpsellType>();
  const upsellIds = new Set<string>();
  const batches = [];

  // Split product IDs into batches
  for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
    batches.push(productIds.slice(i, i + BATCH_SIZE));
  }

  // Fetch products in batches
  for (const batchIds of batches) {
    const productsRef = collection(database, "products");
    const batchQuery = query(
      productsRef,
      where(documentId(), "in", batchIds)
    );

    const snapshot = await getDocs(batchQuery);

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.upsell && typeof data.upsell === "string") {
        upsellIds.add(data.upsell.trim());
      }

      productsMap.set(doc.id, {
        id: doc.id,
        ...data,
      } as ProductType);
    });
  }

  // If we have upsells, fetch them
  if (upsellIds.size > 0) {
    const upsellsMap = await fetchUpsellsInBatches(Array.from(upsellIds));

    // Enhance products with upsell data
    for (const [productId, product] of productsMap) {
      if (
        'upsell' in product &&
        product.upsell &&
        typeof product.upsell === 'string' &&
        upsellsMap.has(product.upsell)
      ) {
        productsMap.set(productId, {
          ...product,
          upsell: upsellsMap.get(product.upsell),
        } as ProductWithUpsellType);
      }
    }
  }

  return productsMap;
}

async function fetchUpsellsInBatches(
  upsellIds: string[]
): Promise<Map<string, UpsellType>> {
  const upsellsMap = new Map<string, UpsellType>();
  const batches = [];

  // Split upsell IDs into batches
  for (let i = 0; i < upsellIds.length; i += BATCH_SIZE) {
    batches.push(upsellIds.slice(i, i + BATCH_SIZE));
  }

  // Process each batch
  for (const batchIds of batches) {
    const upsellsRef = collection(database, "upsells");
    const batchQuery = query(upsellsRef, where(documentId(), "in", batchIds));
    const batchSnapshot = await getDocs(batchQuery);

    // Collect all product IDs from upsells
    const productIds = new Set<string>();
    batchSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      data.products.forEach((product: { id: string }) => {
        productIds.add(product.id);
      });
    });

    // Fetch all referenced products in batches
    const productsMap = new Map<string, ProductType>();
    const productBatches = [];
    const productIdsArray = Array.from(productIds);

    for (let i = 0; i < productIdsArray.length; i += BATCH_SIZE) {
      productBatches.push(productIdsArray.slice(i, i + BATCH_SIZE));
    }

    for (const productBatchIds of productBatches) {
      const productsRef = collection(database, "products");
      const productsQuery = query(
        productsRef,
        where(documentId(), "in", productBatchIds)
      );
      const productsSnapshot = await getDocs(productsQuery);

      productsSnapshot.docs.forEach((doc) => {
        productsMap.set(doc.id, {
          id: doc.id,
          ...doc.data(),
        } as ProductType);
      });
    }

    // Build complete upsell objects
    batchSnapshot.docs.forEach((doc) => {
      const upsellData = doc.data();
      const productsInUpsell = upsellData.products
        .map((productItem: { id: string; index: number; name: string }) => {
          const productData = productsMap.get(productItem.id);
          if (!productData) return null;

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
        .filter(
          (item: any): item is UpsellType["products"][number] => item !== null
        );

      upsellsMap.set(doc.id, {
        id: doc.id,
        mainImage: upsellData.mainImage,
        visibility: upsellData.visibility,
        createdAt: upsellData.createdAt,
        updatedAt: upsellData.updatedAt,
        products: productsInUpsell,
        ...upsellData,
      } as UpsellType);
    });
  }

  return upsellsMap;
}

type GetCollectionsOptionsType = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  includeProducts?: boolean;
};