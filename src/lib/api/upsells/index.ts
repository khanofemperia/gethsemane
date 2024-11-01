import { collection, getDocs, query, where } from "firebase/firestore";
import { database } from "@/lib/firebase";

type UpsellType = {
  id: string;
  mainImage: string;
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
  pricing: PricingType;
  products: Array<{
    index: number;
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    images: {
      main: string;
      gallery: string[];
    };
    options: {
      colors: Array<{
        name: string;
        image: string;
      }>;
      sizes: {
        inches: {
          columns: Array<{ label: string; order: number }>;
          rows: Array<{ [key: string]: string }>;
        };
        centimeters: {
          columns: Array<{ label: string; order: number }>;
          rows: Array<{ [key: string]: string }>;
        };
      };
    };
  }>;
};

type GetUpsellsOptions = {
  ids?: string[];
  fields?: Array<keyof UpsellType>;
  includeProducts?: boolean;
};

// Create a type that represents a partial upsell with only selected fields
type PartialUpsell = Partial<Omit<UpsellType, "id" | "updatedAt">> &
  Pick<UpsellType, "id" | "updatedAt">;

function sanitizeOptions(options: GetUpsellsOptions = {}) {
  return {
    ids: Array.isArray(options.ids)
      ? options.ids.filter(
          (id): id is string => typeof id === "string" && id.trim() !== ""
        )
      : [],
    fields: Array.isArray(options.fields)
      ? options.fields.filter(
          (field): field is keyof UpsellType =>
            typeof field === "string" && field.trim() !== ""
        )
      : [],
    includeProducts: options.includeProducts ?? true,
  };
}

/**
 * Unified function to get upsells with flexible filtering and field selection.
 * Returns null if no upsells are found, otherwise returns an array of upsells.
 * When fields are specified, returns partial upsell objects.
 */
export async function getUpsells(
  options: GetUpsellsOptions = {}
): Promise<UpsellType[] | null> {
  const { ids, fields, includeProducts } = sanitizeOptions(options);

  const upsellsRef = collection(database, "upsells");
  let firestoreQuery = query(upsellsRef);

  if (ids.length > 0) {
    firestoreQuery = query(upsellsRef, where("__name__", "in", ids));
  }

  const snapshot = await getDocs(firestoreQuery);

  if (snapshot.empty) {
    return null;
  }

  const upsells = await Promise.all(
    snapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data() as Omit<UpsellType, "id">;
      const baseUpsell: PartialUpsell = {
        id: docSnapshot.id,
        updatedAt: data.updatedAt,
      };

      if (fields.length > 0) {
        fields.forEach((field) => {
          if (field !== "id" && field in data) {
            (baseUpsell[field as keyof Omit<UpsellType, "id">] as any) =
              data[field as keyof Omit<UpsellType, "id">];
          }
        });
      } else {
        Object.assign(baseUpsell, data);
      }

      if (includeProducts && data.products) {
        const products = [...data.products].sort((a, b) => a.index - b.index);
        return {
          ...baseUpsell,
          products,
        } as UpsellType;
      }

      return baseUpsell as UpsellType;
    })
  );

  return upsells.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}
