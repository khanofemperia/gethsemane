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
 * Unified function to get products with flexible filtering and field selection.
 *
 * @example Get a single product
 * const product = await getProducts({ ids: ["product-id"] });
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
  const { ids = [], fields = [], visibility, category } = options;

  const includeUpsells = !fields.length || fields.includes("upsell");

  // Build the base query
  const productsRef = collection(database, "products");
  let conditions: any[] = [];

  if (ids.length > 0) {
    conditions.push(where("__name__", "in", ids));
  }
  if (visibility) {
    conditions.push(where("visibility", "==", visibility));
  }
  if (category) {
    conditions.push(where("category", "==", category));
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
        updatedAt: data["updatedAt"],
        visibility: data["visibility"],
      };

      // Fetch upsell details if requested and available
      if (
        includeUpsells &&
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

// -- Logic & Utilities --

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

type GetProductsOptionsType = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  category?: string;
};
