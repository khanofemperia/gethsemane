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
  data: {
    id: string;
  } & Partial<ProductType>
) {
  try {
    const docRef = doc(database, "upsells", data.id);
    const docSnap = await getDoc(docRef);
    const currentUpsell = docSnap.data();

    const updatedUpsell = {
      ...currentUpsell,
      ...data,
      updatedAt: currentTimestamp(),
    };

    await setDoc(docRef, updatedUpsell);
    revalidatePath("/admin/shop/upsells/[id]", "page");

    return {
      type: AlertMessageType.SUCCESS,
      message: "Upsell updated successfully",
    };
  } catch (error) {
    console.error("Error updating upsell:", error);
    return { type: AlertMessageType.ERROR, message: "Failed to update upsell" };
  }
}
