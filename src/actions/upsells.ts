"use server";

import { database } from "@/lib/firebase";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { generateId, currentTimestamp } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { AlertMessageType } from "@/lib/sharedTypes";

export async function CreateUpsellAction(data: Partial<UpsellType>) {
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
    revalidatePath("/admin/shop/upsells");

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
  data: { id: string } & Partial<UpsellType>
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
    revalidatePath(`/admin/shop/upsells/${data.id}`, "page"); // Admin edit upsell page
    revalidatePath("/admin/shop/upsells"); // Admin upsells page
    revalidatePath(`/`); // Public main page

    // Revalidate products related to the updated upsell
    if (currentUpsell.products.length > 0) {
      currentUpsell.products.forEach((product) => {
        revalidatePath(`/${product.slug}-${product.id}`); // Public product details page
        revalidatePath(`/admin/shop/products/${product.slug}-${product.id}`); // Admin edit product page
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
