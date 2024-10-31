import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { database } from "@/lib/firebase";
import { getProducts } from "../products/service";

type GetCollectionsOptions = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  includeProducts?: boolean;
};

type Sortable = { [key: string]: any };

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

type CollectionWithProductsAndUpsellsType = Omit<CollectionType, "products"> & {
  products: ProductWithUpsellType[];
};

function sortItems<T extends Sortable>(
  items: T[],
  key: keyof T,
  isDate: boolean = false
): T[] {
  return items.sort((a, b) => {
    if (isDate) {
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    }
    return (a[key] as number) - (b[key] as number);
  });
}

function sanitizeOptions(options: GetCollectionsOptions = {}) {
  return {
    ids: Array.isArray(options.ids)
      ? options.ids.filter(
          (id): id is string => typeof id === "string" && id.trim() !== ""
        )
      : [],
    fields: Array.isArray(options.fields)
      ? options.fields.filter(
          (field): field is string =>
            typeof field === "string" && field.trim() !== ""
        )
      : [],
    visibility: options.visibility,
    includeProducts:
      options.includeProducts ?? options.fields?.includes("products") ?? false,
  };
}

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
  options: GetCollectionsOptions = {}
): Promise<CollectionType[] | CollectionWithProductsAndUpsellsType[] | null> {
  const { ids, fields, visibility, includeProducts } = sanitizeOptions(options);

  // Build the base query
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

  // Process collections
  const collections = await Promise.all(
    snapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();
      let selectedFields: Partial<CollectionType> = {};

      // Handle basic fields
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
        updatedAt: data["updatedAt"],
        index: data["index"],
        visibility: data["visibility"],
        collectionType: data["collectionType"],
      };

      // Handle products if requested
      if (includeProducts && data.products?.length) {
        const productIds = data.products.map((p: { id: string }) => p.id);
        const products = await getProducts({
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
        });

        if (products) {
          // Add index information from the collection's product data
          const productsWithIndex = products.map((product) => {
            const productIndex =
              data.products.find((p: { id: string }) => p.id === product.id)
                ?.index ?? 0;
            return { ...product, index: productIndex };
          });

          return {
            ...collection,
            products: productsWithIndex,
          } as CollectionWithProductsAndUpsellsType;
        }
      }

      return collection as CollectionType;
    })
  );

  const sortedCollections = sortItems(collections, "index");
  return sortedCollections;
}
