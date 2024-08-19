import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { database } from "@/lib/firebase";
import { capitalizeFirstLetter } from "./utils";

type BaseOptionsType = {
  fields?: string[];
  visibility?: VisibilityType;
};

type SingleItemOptionsType = {
  id: string;
  fields?: string[];
};

type GetProductsByIdsOptionsType = {
  ids: string[];
  fields?: string[];
  visibility?: VisibilityType;
};

type SanitizedSingleItemOptionsType = {
  id: string;
  fields: string[];
};

type SanitizedMultiItemOptionsType = {
  ids: string[];
  fields: string[];
  visibility?: VisibilityType;
};

type GetProductsByCategoryOptionsType = {
  category: string; // Category is required
  fields?: string[];
  visibility?: VisibilityType;
};

type SanitizedGetProductsByCategoryOptionsType = {
  category: string;
  fields: string[];
  visibility?: VisibilityType;
};

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
      mainImage: string;
      basePrice: number;
    }[];
  };
};

type CollectionWithProductsAndUpsellsType = Omit<CollectionType, "products"> & {
  products: ProductWithUpsellType[];
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
    } else {
      return (a[key] as number) - (b[key] as number);
    }
  });
}

function sanitizeSingleItemOptions(
  options: SingleItemOptionsType
): SanitizedSingleItemOptionsType {
  return {
    id: typeof options.id === "string" ? options.id.trim() : "",
    fields: Array.isArray(options.fields)
      ? options.fields.filter(
          (field): field is string =>
            typeof field === "string" && field.trim() !== ""
        )
      : [],
  };
}

function sanitizeMultiItemOptions(
  options: GetProductsByIdsOptionsType
): SanitizedMultiItemOptionsType {
  const sanitizedOptions: SanitizedMultiItemOptionsType = {
    ids: [],
    fields: [],
  };

  if (Array.isArray(options.ids)) {
    sanitizedOptions.ids = options.ids.filter(
      (id): id is string => typeof id === "string" && id.trim() !== ""
    );
  }

  if (Array.isArray(options.fields)) {
    sanitizedOptions.fields = options.fields.filter(
      (field): field is string =>
        typeof field === "string" && field.trim() !== ""
    );
  }

  const validVisibilityFlags: VisibilityType[] = [
    "DRAFT",
    "PUBLISHED",
    "HIDDEN",
  ];
  if (typeof options.visibility === "string") {
    const uppercaseVisibility =
      options.visibility.toUpperCase() as VisibilityType;
    if (validVisibilityFlags.includes(uppercaseVisibility)) {
      sanitizedOptions.visibility = uppercaseVisibility;
    }
  }

  return sanitizedOptions;
}

function sanitizeBaseOptions(
  options: BaseOptionsType
): SanitizedMultiItemOptionsType {
  return {
    ids: [],
    fields: Array.isArray(options.fields)
      ? options.fields.filter(
          (field): field is string =>
            typeof field === "string" && field.trim() !== ""
        )
      : [],
    visibility: options.visibility,
  };
}

function sanitizeGetProductsByCategoryOptions(
  options: GetProductsByCategoryOptionsType
): SanitizedGetProductsByCategoryOptionsType {
  return {
    category: options.category.trim(),
    fields: Array.isArray(options.fields)
      ? options.fields.filter(
          (field): field is string =>
            typeof field === "string" && field.trim() !== ""
        )
      : [],
    visibility: options.visibility,
  };
}

/**
 * Get a product by ID. Optionally specify fields.
 *
 * @example
 * const product = await getProduct({
 *   id: "12345",
 *   fields: ['id', 'name', 'pricing'],
 * });
 */
export async function getProduct(
  options: SingleItemOptionsType
): Promise<Partial<ProductType> | null> {
  const sanitizedOptions = sanitizeSingleItemOptions(options);
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
 *   fields: ['id', 'name', 'pricing'],
 *   visibility: 'PUBLISHED'
 * });
 */
export async function getProducts(
  options: BaseOptionsType = {}
): Promise<ProductType[] | null> {
  const sanitizedOptions = sanitizeBaseOptions(options);
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

  const sortedProducts = sortItems(products, "updatedAt", true);
  return sortedProducts;
}

/**
 * Get multiple products by their IDs. Optionally specify fields and visibility.
 *
 * @example
 * const products = await getProductsByIds({
 *   ids: ["1", "2", "3"],
 *   fields: ['id', 'name', 'pricing'],
 *   visibility: 'PUBLISHED'
 * });
 */
export async function getProductsByIds(
  options: GetProductsByIdsOptionsType
): Promise<ProductType[] | null> {
  const sanitizedOptions = sanitizeMultiItemOptions(options);
  const { ids, fields, visibility } = sanitizedOptions;

  if (!ids || ids.length === 0) {
    return null;
  }

  const productsRef = collection(database, "products");
  let firestoreQuery = query(productsRef, where("__name__", "in", ids));

  if (visibility) {
    firestoreQuery = query(
      firestoreQuery,
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

  const sortedProducts = sortItems(products, "updatedAt", true);
  return sortedProducts;
}

/**
 * Get a product with its upsell and related products.
 *
 * @example
 * const productWithUpsell = await getProductWithUpsell({
 *   id: "12345",
 * });
 */
export async function getProductWithUpsell(
  options: SingleItemOptionsType
): Promise<ProductWithUpsellType | ProductType | null> {
  const product = await getProduct(options);

  if (!product) {
    return null;
  }

  if (!product.upsell || product.upsell === "") {
    return product as ProductType;
  }

  const upsellDocRef = doc(database, "upsells", product.upsell);
  const upsellSnapshot = await getDoc(upsellDocRef);

  if (!upsellSnapshot.exists()) {
    return product as ProductType;
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
        mainImage: productData.images.main,
        basePrice: productData.pricing.basePrice,
      };
    })
  );

  const upsellDetails = {
    ...upsellData,
    products: productsInUpsell.filter(
      (item): item is UpsellType["products"][number] => item !== null
    ),
  };

  return {
    ...product,
    upsell: upsellDetails,
  };
}

/**
 * Get multiple products by their IDs with their upsell details.
 *
 * @example
 * const productsWithUpsells = await getProductsWithUpsells({
 *   ids: ["1", "2", "3"],
 *   fields: ['id', 'name', 'pricing'],
 *   visibility: 'PUBLISHED'
 * });
 */
export async function getProductsWithUpsells(
  options: BaseOptionsType = {}
): Promise<ProductWithUpsellType[] | null> {
  const sanitizedOptions = sanitizeBaseOptions(options);
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

      const product: Partial<ProductType> = {
        id: docSnapshot.id,
        ...selectedFields,
        updatedAt: data["updatedAt"],
        visibility: data["visibility"],
      };

      // Fetch upsell details if an upsell ID is present and non-empty
      let upsell = undefined;
      if (product.upsell && product.upsell.trim()) {
        const upsellDocRef = doc(database, "upsells", product.upsell);
        const upsellSnapshot = await getDoc(upsellDocRef);

        if (upsellSnapshot.exists()) {
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
                mainImage: productData.images.main,
                basePrice: productData.pricing.basePrice,
                options: productData.options,
              };
            })
          );

          upsell = {
            ...upsellData,
            products: productsInUpsell.filter(
              (item): item is UpsellType["products"][number] => item !== null
            ),
          };
        }
      }

      return {
        ...product,
        upsell: upsell || "",
      } as ProductWithUpsellType;
    })
  );

  const sortedProducts = sortItems(products, "updatedAt", true);
  return sortedProducts;
}

export async function getProductsByIdsWithUpsells(
  options: GetProductsByIdsOptionsType
): Promise<ProductWithUpsellType[] | ProductType[] | null> {
  const sanitizedOptions = sanitizeMultiItemOptions(options);
  const { ids, fields, visibility } = sanitizedOptions;

  if (!ids || ids.length === 0) {
    return null;
  }

  const productsRef = collection(database, "products");
  let firestoreQuery = query(productsRef, where("__name__", "in", ids));

  if (visibility) {
    firestoreQuery = query(
      firestoreQuery,
      where("visibility", "==", visibility)
    );
  }

  const snapshot = await getDocs(firestoreQuery);

  if (snapshot.empty) {
    return null;
  }

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

      const product: Partial<ProductType> = {
        id: docSnapshot.id,
        ...selectedFields,
        updatedAt: data["updatedAt"],
        visibility: data["visibility"],
      };

      // Fetch upsell details if an upsell ID is present and non-empty
      let upsell = undefined;
      if (product.upsell && product.upsell.trim()) {
        const upsellDocRef = doc(database, "upsells", product.upsell);
        const upsellSnapshot = await getDoc(upsellDocRef);

        if (upsellSnapshot.exists()) {
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
                mainImage: productData.images.main,
                basePrice: productData.pricing.basePrice,
                options: productData.options,
              };
            })
          );

          upsell = {
            ...upsellData,
            products: productsInUpsell.filter(
              (item): item is UpsellType["products"][number] => item !== null
            ),
          };
        }
      }

      return {
        ...product,
        upsell: upsell || "",
      } as ProductWithUpsellType;
    })
  );

  const sortedProducts = sortItems(products, "updatedAt", true);
  return sortedProducts;
}

/**
 * Get products by category. Category is required. Optionally specify fields and visibility.
 *
 * @example
 * const products = await getProductsByCategoryWithUpsell({
 *   category: "dresses",
 *   fields: ['id', 'name', 'pricing'],
 *   visibility: 'PUBLISHED'
 * });
 */
export async function getProductsByCategoryWithUpsell(
  options: GetProductsByCategoryOptionsType
): Promise<ProductWithUpsellType[] | ProductType[] | null> {
  const sanitizedOptions = sanitizeGetProductsByCategoryOptions(options);
  const { category, fields, visibility } = sanitizedOptions;

  if (!category) {
    throw new Error("Category is required.");
  }

  const collectionRef = collection(database, "products");

  let firestoreQuery = query(
    collectionRef,
    where("category", "==", capitalizeFirstLetter(category))
  );

  if (visibility) {
    firestoreQuery = query(
      firestoreQuery,
      where("visibility", "==", visibility)
    );
  }

  const snapshot = await getDocs(firestoreQuery);

  if (snapshot.empty) {
    return null;
  }

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

      const product: Partial<ProductType> = {
        id: docSnapshot.id,
        ...selectedFields,
        updatedAt: data["updatedAt"],
        visibility: data["visibility"],
      };

      let upsell = undefined;
      if (product.upsell && product.upsell.trim()) {
        const upsellDocRef = doc(database, "upsells", product.upsell);
        const upsellSnapshot = await getDoc(upsellDocRef);

        if (upsellSnapshot.exists()) {
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
                mainImage: productData.images.main,
                basePrice: productData.pricing.basePrice,
              };
            })
          );

          upsell = {
            ...upsellData,
            products: productsInUpsell.filter(
              (item): item is UpsellType["products"][number] => item !== null
            ),
          };
        }
      }

      return {
        ...product,
        upsell: upsell || "",
      } as ProductWithUpsellType;
    })
  );

  const sortedProducts = sortItems(products, "updatedAt", true);
  return sortedProducts;
}

/**
 * Get a collection by ID. Optionally specify fields.
 *
 * @example
 * const collection = await getCollection({
 *   id: "12345",
 *   fields: ['id', 'title', 'products'],
 * });
 */
export async function getCollection(
  options: SingleItemOptionsType
): Promise<Partial<CollectionType> | null> {
  const sanitizedOptions = sanitizeSingleItemOptions(options);
  const { id, fields } = sanitizedOptions;

  if (!id) {
    return null;
  }

  const documentRef = doc(database, "collections", id);
  const snapshot = await getDoc(documentRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

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
    id: snapshot.id,
    ...selectedFields,
  };

  return collection;
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
  const sanitizedOptions = sanitizeBaseOptions(options);
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

  const sortedCollections = sortItems(collections, "index");
  return sortedCollections;
}

export async function getCollectionWithProductsAndUpsells(
  options: SingleItemOptionsType
): Promise<CollectionWithProductsAndUpsellsType | null> {
  const sanitizedOptions = sanitizeSingleItemOptions(options);
  const { id, fields } = sanitizedOptions;

  if (!id) {
    return null;
  }

  const collectionDocRef = doc(database, "collections", id);
  const collectionSnapshot = await getDoc(collectionDocRef);

  if (!collectionSnapshot.exists()) {
    return null;
  }

  const collectionData = collectionSnapshot.data();

  let selectedFields: Partial<CollectionType> = {};
  if (fields.length) {
    fields.forEach((field) => {
      if (collectionData.hasOwnProperty(field)) {
        selectedFields[field as keyof CollectionType] = collectionData[field];
      }
    });
  } else {
    selectedFields = collectionData;
  }

  const productsWithUpsells = await Promise.all(
    collectionData.products.map(
      async ({ id, index }: { id: string; index: number }) => {
        const productWithUpsell = await getProductWithUpsell({
          id,
          fields,
        });

        if (productWithUpsell && productWithUpsell.id) {
          return { ...productWithUpsell, index };
        } else {
          return null;
        }
      }
    )
  );

  const filteredProducts = productsWithUpsells.filter((item) => item !== null);

  const collectionWithProducts = {
    id: collectionSnapshot.id,
    ...selectedFields,
    products: filteredProducts as ProductWithUpsellType[],
  } as {
    id: string;
    index: number;
    title: string;
    slug: string;
    campaignDuration: DateRangeType;
    collectionType: string;
    bannerImages?: {
      desktopImage: string;
      mobileImage: string;
    };
    products: Omit<ProductType, "upsell"> &
      {
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
            mainImage: string;
            basePrice: number;
          }[];
        };
      }[];
    visibility: VisibilityType;
    createdAt: string;
    updatedAt: string;
  };

  return collectionWithProducts;
}

export async function getUpsells(): Promise<UpsellType[] | null> {
  const collectionRef = collection(database, "upsells");
  const snapshot = await getDocs(collectionRef);

  const upsells: UpsellType[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<UpsellType, "id">),
  }));

  const sortedUpsells = sortItems(upsells, "updatedAt", true);
  return sortedUpsells;
}

export async function getUpsell({
  id,
}: {
  id: string;
}): Promise<Partial<UpsellType> | null> {
  const documentRef = doc(database, "upsells", id);
  const snapshot = await getDoc(documentRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  const sortedProducts = data.products
    ? [...data.products].sort((a, b) => a.index - b.index)
    : [];

  const upsell: Partial<UpsellType> = {
    id: snapshot.id,
    ...data,
    products: sortedProducts,
  };

  return upsell;
}

export async function getPageHero(): Promise<PageHeroType> {
  const documentRef = doc(database, "pageHero", "homepageHero");
  const snapshot = await getDoc(documentRef);

  const defaultPageHero: Omit<PageHeroType, "id"> = {
    images: {
      desktop: "",
      mobile: "",
    },
    title: "",
    destinationUrl: "",
    visibility: "HIDDEN",
  };

  if (!snapshot.exists()) {
    await setDoc(documentRef, defaultPageHero);
    return { id: documentRef.id, ...defaultPageHero };
  }

  return { id: snapshot.id, ...(snapshot.data() as Omit<PageHeroType, "id">) };
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

export async function getSettings(): Promise<SettingsType | null> {
  const defaultSettings: SettingsType = {
    categorySection: {
      visibility: "HIDDEN",
    },
  };

  const documentRef = doc(database, "settings", "defaultSettings");
  const snapshot = await getDoc(documentRef);

  if (!snapshot.exists()) {
    await setDoc(documentRef, defaultSettings);
    return defaultSettings;
  }

  const currentSettings = snapshot.data() as SettingsType;
  let needsUpdate = false;

  for (const key of Object.keys(defaultSettings)) {
    if (!(key in currentSettings)) {
      currentSettings[key] = defaultSettings[key];
      needsUpdate = true;
    }
  }

  for (const key of Object.keys(currentSettings)) {
    if (!(key in defaultSettings)) {
      delete currentSettings[key];
      needsUpdate = true;
    }
  }

  if (needsUpdate) {
    await setDoc(documentRef, currentSettings);
  }

  return currentSettings;
}

export async function getDiscoveryProducts(
  options: {
    limit?: number;
    fields?: string[];
  } = {}
): Promise<ProductWithUpsellType[] | null> {
  const { limit = 20, fields } = options;

  const allProducts = await getProductsWithUpsells({
    fields: fields,
    visibility: "PUBLISHED",
  });

  if (!allProducts || allProducts.length === 0) {
    return null;
  }

  return allProducts.slice(0, limit);
}
