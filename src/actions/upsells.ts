"use server";

import { database } from "@/lib/firebase";
import { setDoc, doc, getDoc, deleteDoc } from "firebase/firestore";
import { generateId, currentTimestamp } from "@/lib/utils/common";
import { revalidatePath } from "next/cache";
import { AlertMessageType } from "@/lib/sharedTypes";

export async function CreateUpsellAction(
  data: Partial<Omit<UpsellType, "products">> & {
    products?: ProductWithoutOptions[];
  }
) {
  try {
    const documentRef = doc(database, "upsells", generateId());
    const currentTime = currentTimestamp();

    const upsell = {
      ...data,
      visibility: "DRAFT",
      updatedAt: currentTime,
      createdAt: currentTime,
    };

    await setDoc(documentRef, upsell);
    revalidatePath("/admin/upsells");

    return {
      type: AlertMessageType.SUCCESS,
      message: "Upsell created successfully",
    };
  } catch (error) {
    console.error("Error creating upsell:", error);
    return { type: AlertMessageType.ERROR, message: "Failed to create upsell" };
  }
}

export async function UpdateUpsellAction(
  data: { id: string } & Partial<Omit<UpsellType, "products">> & {
      products?: ProductWithoutOptions[];
    }
) {
  try {
    const docRef = doc(database, "upsells", data.id);
    const docSnap = await getDoc(docRef);
    const currentUpsell = docSnap.data() as UpsellType;

    const updatedUpsell = {
      ...currentUpsell,
      ...data,
      updatedAt: currentTimestamp(),
    };

    await setDoc(docRef, updatedUpsell);

    // Revalidate paths to update upsell data
    revalidatePath(`/admin/upsells/${data.id}`, "page"); // Admin edit upsell page
    revalidatePath("/admin/upsells"); // Admin upsells page
    revalidatePath(`/`); // Public main page

    // Revalidate products related to the updated upsell
    if (currentUpsell.products.length > 0) {
      currentUpsell.products.forEach((product) => {
        revalidatePath(`/${product.slug}-${product.id}`); // Public product details page
        revalidatePath(`/admin/products/${product.slug}-${product.id}`); // Admin edit product page
      });
    }

    return {
      type: AlertMessageType.SUCCESS,
      message: "Upsell updated successfully",
    };
  } catch (error) {
    console.error("Error updating upsell:", error);
    return { type: AlertMessageType.ERROR, message: "Failed to update upsell" };
  }
}

export async function DeleteUpsellAction(data: { id: string }) {
  try {
    const upsellDocRef = doc(database, "upsells", data.id);
    const upsellSnap = await getDoc(upsellDocRef);
    
    if (!upsellSnap.exists()) {
      return {
        type: AlertMessageType.ERROR,
        message: "Upsell not found",
      };
    }

    await deleteDoc(upsellDocRef);

    revalidatePath("/admin/upsells"); // Admin upsells page
    revalidatePath("/"); // Public main page

    return {
      type: AlertMessageType.SUCCESS,
      message: "Upsell deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting upsell:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to delete upsell",
    };
  }
}

// -- Logic & Utilities --

type ProductWithoutOptions = {
  index: number;
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  images: {
    main: string;
    gallery: string[];
  };
};