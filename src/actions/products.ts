"use server";

import { database } from "@/lib/firebase";
import {
  setDoc,
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { generateId, currentTimestamp } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { AlertMessageType } from "@/lib/sharedTypes";

type CreateProductType = {
  name: string;
  slug: string;
  category: string;
  basePrice: string;
  mainImage: string;
};

type ColorType = {
  name: string;
  image: string;
};

type EditProduct = {
  id: string;
  name?: string;
  price?: string;
  slug?: string;
  description?: string;
  mainImage?: string | null;
  images?: string[] | null;
  sizes?: SizeChartType | null;
  colors?: ColorType[] | null;
  visibility?: string;
};

export async function CreateProductAction(data: CreateProductType) {
  try {
    const documentRef = doc(database, "products", generateId());
    const currentTime = currentTimestamp();

    const product = {
      name: data.name,
      slug: data.slug,
      category: data.category,
      description: "",
      highlights: {
        headline: "",
        keyPoints: [],
      },
      pricing: {
        basePrice: data.basePrice,
        salePrice: 0,
        discountPercentage: 0,
      },
      images: {
        main: data.mainImage,
        gallery: [],
      },
      variants: {
        colors: [],
        sizes: [],
      },
      sizeChart: {
        columns: [],
        measurements: [],
      },
      seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: [],
      },
      visibility: "DRAFT",
      createdAt: currentTime,
      updatedAt: currentTime,
      sourceInfo: {
        platform: "",
        url: "",
        storeId: "",
        storeName: "",
        storeUrl: "",
      },
    };

    await setDoc(documentRef, product);

    revalidatePath("/admin/shop/products");

    return {
      type: AlertMessageType.SUCCESS,
      message: "Product created successfully",
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to create product",
    };
  }
}

export async function UpdateProductAction(data: EditProduct) {
  try {
    const docRef = doc(database, "products", data.id);
    const docSnap = await getDoc(docRef);
    const currentProduct = docSnap.data();

    const updatedProduct = {
      ...currentProduct,
      ...data,
      updatedAt: currentTimestamp(),
    };

    await setDoc(docRef, updatedProduct);
    revalidatePath("/admin/shop/products/[slug]", "page");

    return {
      type: AlertMessageType.SUCCESS,
      message: "Product updated successfully",
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to update product",
    };
  }
}
