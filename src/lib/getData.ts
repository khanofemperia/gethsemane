import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { database } from "@/lib/firebase";

type BaseOptionsType = {
  fields?: string[];
  visibility?: string;
};

type SingleItemOptionsType = {
  id: string;
  fields?: string[];
};

type SanitizedOptionsType = {
  id?: string;
  fields: string[];
  visibility?: "DRAFT" | "PUBLISHED" | "HIDDEN";
};

function sanitizeOptions(
  options: BaseOptionsType | SingleItemOptionsType
): SanitizedOptionsType {
  const sanitizedOptions: SanitizedOptionsType = {
    fields: [],
  };

  if ("id" in options && typeof options.id === "string") {
    sanitizedOptions.id = options.id.trim();
  }

  if (Array.isArray(options.fields)) {
    sanitizedOptions.fields = options.fields.filter(
      (field): field is string =>
        typeof field === "string" && field.trim() !== ""
    );
  }

  const validVisibilityFlags = ["DRAFT", "PUBLISHED", "HIDDEN"] as const;
  if ("visibility" in options && typeof options.visibility === "string") {
    const uppercaseVisibility = options.visibility.toUpperCase();
    if (validVisibilityFlags.includes(uppercaseVisibility as any)) {
      sanitizedOptions.visibility = uppercaseVisibility as
        | "DRAFT"
        | "PUBLISHED"
        | "HIDDEN";
    }
  }

  return sanitizedOptions;
}

function sortProducts<T extends { updatedAt: string }>(products: T[]): T[] {
  return products.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function sortCollections<T extends { index: number }>(collections: T[]): T[] {
  return collections.sort((a, b) => a.index - b.index);
}

/**
 * Get a product by ID. Optionally specify fields.
 *
 * @example
 * const product = await getProduct({
 *   id: "12345",
 *   fields: ['id', 'name', 'price'],
 * });
 */
export async function getProduct(
  options: SingleItemOptionsType
): Promise<Partial<ProductType> | null> {
  const sanitizedOptions = sanitizeOptions(options);
  const { id, fields } = sanitizedOptions;

  if (!id) {
    return null;
  }

  const documentRef = doc(database, "products", id);
  const snapshot = await getDoc(documentRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

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
    id: snapshot.id,
    ...selectedFields,
  };

  return product;
}

/**
 * Get products. Optionally specify fields and visibility.
 *
 * @example
 * const products = await getProducts({
 *   fields: ['id', 'name', 'price'],
 *   visibility: 'PUBLISHED'
 * });
 */
export async function getProducts(
  options: BaseOptionsType = {}
): Promise<ProductType[] | null> {
  const sanitizedOptions = sanitizeOptions(options);
  const { fields, visibility } = sanitizedOptions;

  const collectionRef = collection(database, "products");

  let firestoreQuery = query(collectionRef);

  if (visibility) {
    firestoreQuery = query(
      collectionRef,
      where("visibility", "==", visibility)
    );
  }

  const snapshot = await getDocs(firestoreQuery);

  if (snapshot.empty) {
    return null;
  }

  const products = snapshot.docs.map((doc) => {
    const data = doc.data();
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

    return {
      id: doc.id,
      ...selectedFields,
      updatedAt: data["updatedAt"],
      visibility: data["visibility"],
    } as ProductType;
  });

  return sortProducts(products);
}

export async function getPageHero(): Promise<PageHeroType | null> {
  const documentRef = doc(database, "pageHero", "homepageHero");
  const snapshot = await getDoc(documentRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as PageHeroType;
}

export async function getCategories(): Promise<CategoryType[] | null> {
  const snapshot = await getDocs(collection(database, "categories"));

  if (snapshot.empty) {
    return null;
  }

  const categories: CategoryType[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<CategoryType, "id">),
  }));

  categories.sort((a, b) => a.index - b.index);

  return categories;
}

/**
 * Get collections. Optionally specify fields and visibility.
 *
 * @example
 * const collections = await getCollections({
 *   fields: ['id', 'title', 'products'],
 *   visibility: 'PUBLISHED'
 * });
 */
export async function getCollections(
  options: BaseOptionsType = {}
): Promise<Partial<CollectionType>[] | null> {
  const sanitizedOptions = sanitizeOptions(options);
  const { fields, visibility } = sanitizedOptions;

  const firestoreCollectionRef = collection(database, "collections");

  let firestoreQuery = query(firestoreCollectionRef);

  if (visibility) {
    firestoreQuery = query(
      firestoreCollectionRef,
      where("visibility", "==", visibility)
    );
  }

  const snapshot = await getDocs(firestoreQuery);

  if (snapshot.empty) {
    return null;
  }

  const collections = await Promise.all(
    snapshot.docs.map(async (document) => {
      const data = document.data();
      const selectedFields: Partial<CollectionType> = {};

      fields.forEach((field) => {
        if (data.hasOwnProperty(field)) {
          selectedFields[field as keyof CollectionType] = data[field];
        }
      });

      if (fields.includes("products")) {
        selectedFields.products = await Promise.all(
          (data.products || []).map(
            async (product: { id: string; index: number }) => {
              const productDoc = await getDoc(
                doc(database, "products", product.id)
              );
              return {
                ...productDoc.data(),
                id: product.id,
                index: product.index,
              };
            }
          )
        );
      }

      return {
        id: document.id,
        ...selectedFields,
        updatedAt: data["updatedAt"],
        index: data["index"],
        visibility: data["visibility"],
        collectionType: data["collectionType"],
      };
    })
  );

  return sortCollections(collections);
}
