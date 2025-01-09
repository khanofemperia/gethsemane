"use server";

import {
  collection,
  getDocs,
  query,
  where,
  documentId,
} from "firebase/firestore";
import { database } from "@/lib/firebase";
import { capitalizeFirstLetter } from "@/lib/utils/common";

const BATCH_SIZE = 10; // Firestore limitation is 10 items per 'in' query

/**
 *
 * @example Get a single product
 * const product = await getProducts({ ids: ["id1"] });
 *
 * @example Get multiple products with specific fields
 * const products = await getProducts({
 *   ids: ["id1", "id2"],
 *   fields: ["name", "pricing", "upsell"]
 * });
 *
 * @example Get all published products in a category
 * const products = await getProducts({
 *   category: "dresses",
 *   visibility: "PUBLISHED"
 * });
 *
 * @example Get products with upsells
 * const products = await getProducts({
 *   ids: ["id1", "id2"],
 *   fields: ["name", "pricing", "upsell"]
 * });
 */
export async function getProducts(
  options: GetProductsOptionsType = {}
): Promise<(ProductType | ProductWithUpsellType)[] | null> {
  const { ids, fields = [], visibility, category } = options;

  if (ids && Array.isArray(ids) && ids.length === 0) {
    return null;
  }

  const includeUpsell = fields.includes("upsell");

  // Build the base query
  const productsRef = collection(database, "products");
  let conditions: any[] = [];

  if (ids && ids.length > 0) {
    conditions.push(where(documentId(), "in", ids));
  }
  if (visibility) {
    conditions.push(where("visibility", "==", visibility));
  }
  if (category) {
    conditions.push(where("category", "==", capitalizeFirstLetter(category)));
  }

  const firestoreQuery =
    conditions.length > 0
      ? query(productsRef, ...conditions)
      : query(productsRef);

  const snapshot = await getDocs(firestoreQuery);

  if (snapshot.empty) {
    return null;
  }

  // Extract products and collect upsell IDs
  const products: ProductType[] = [];
  const upsellIds = new Set<string>();

  snapshot.docs.forEach((docSnapshot) => {
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
      updatedAt: data["updatedAt"],
      visibility: data["visibility"],
    } as ProductType;

    if (includeUpsell && product.upsell && typeof product.upsell === "string") {
      upsellIds.add(product.upsell.trim());
    }

    products.push(product);
  });

  // Fetch upsells in batches if needed
  let upsellsMap: Map<string, UpsellType> = new Map();

  if (includeUpsell && upsellIds.size > 0) {
    upsellsMap = await fetchUpsellsInBatches(Array.from(upsellIds));
  }

  // Enhance products with upsell details
  const enhancedProducts = await Promise.all(
    products.map(async (product) => {
      if (
        includeUpsell &&
        product.upsell &&
        typeof product.upsell === "string" &&
        upsellsMap.has(product.upsell)
      ) {
        return {
          ...product,
          upsell: upsellsMap.get(product.upsell),
        } as ProductWithUpsellType;
      }
      return product;
    })
  );

  return enhancedProducts.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
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
        productsMap.set(doc.id, { id: doc.id, ...doc.data() } as ProductType);
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

type GetProductsOptionsType = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  category?: string;
};