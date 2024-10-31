import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { database } from "@/lib/firebase";
import { capitalizeFirstLetter } from "@/lib/utils";

type GetProductsOptions = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  category?: string;
};

type Sortable = { [key: string]: any };

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

function sanitizeOptions(options: GetProductsOptions = {}) {
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
    category: options.category
      ? capitalizeFirstLetter(options.category.trim())
      : undefined,
  };
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
  options: GetProductsOptions = {}
): Promise<(ProductType | ProductWithUpsellType)[] | null> {
  const { ids, fields, visibility, category } = sanitizeOptions(options);
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

  const sortedProducts = sortItems(products, "updatedAt", true);
  return sortedProducts;
}
