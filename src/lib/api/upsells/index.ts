import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { database } from "@/lib/firebase";

type GetUpsellsOptions = {
  ids?: string[];
  fields?: string[];
  includeProducts?: boolean;
};

function sanitizeOptions(options: GetUpsellsOptions = {}) {
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
    includeProducts: options.includeProducts ?? true,
  };
}

function sortItems<T extends { [key: string]: any }>(
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

/**
 * Unified function to get upsells with flexible filtering and field selection.
 *
 * @example Get a single upsell
 * const upsell = await getUpsells({ ids: ["upsell-id"] });
 *
 * @example Get multiple upsells with specific fields
 * const upsells = await getUpsells({
 *   ids: ["id1", "id2"],
 *   fields: ["name", "description"]
 * });
 *
 * @example Get all upsells without product details
 * const upsells = await getUpsells({
 *   includeProducts: false
 * });
 */
export async function getUpsells(
  options: GetUpsellsOptions = {}
): Promise<UpsellType[] | null> {
  const { ids, fields, includeProducts } = sanitizeOptions(options);

  // Build the base query
  const upsellsRef = collection(database, "upsells");
  let firestoreQuery = query(upsellsRef);

  // Add ID filtering if specified
  if (ids.length > 0) {
    firestoreQuery = query(upsellsRef, where("__name__", "in", ids));
  }

  const snapshot = await getDocs(firestoreQuery);

  if (snapshot.empty) {
    return null;
  }

  // Process upsells
  const upsells = await Promise.all(
    snapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();
      let selectedFields: Partial<UpsellType> = {};

      // Handle field selection
      if (fields.length) {
        fields.forEach((field) => {
          if (data.hasOwnProperty(field)) {
            selectedFields[field as keyof UpsellType] = data[field];
          }
        });
      } else {
        selectedFields = data;
      }

      // Ensure critical fields are always included
      const baseUpsell = {
        id: docSnapshot.id,
        ...selectedFields,
        updatedAt: data.updatedAt,
      };

      // Handle products
      if (includeProducts && data.products) {
        const products = [...data.products].sort((a, b) => a.index - b.index);
        return {
          ...baseUpsell,
          products,
        };
      }

      // Return without products if not requested
      return baseUpsell;
    })
  );

  // Sort by updatedAt in descending order
  const sortedUpsells = sortItems(upsells, "updatedAt", true);
  return sortedUpsells;
}
