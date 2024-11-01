import { collection, getDocs, query, where } from "firebase/firestore";
import { database } from "@/lib/firebase";
import { getProducts } from "../products";

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
  const { ids, fields, visibility, includeProducts } = sanitizeOptions(options);

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

function sanitizeOptions(options: GetCollectionsOptionsType = {}) {
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

// -- Type Definitions --

type GetCollectionsOptionsType = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  includeProducts?: boolean;
};