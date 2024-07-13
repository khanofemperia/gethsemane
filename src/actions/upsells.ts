"use server";

import { database } from "@/libraries/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { generateId, currentTimestamp } from "@/libraries/utils";
import { revalidatePath } from "next/cache";
import { AlertMessageType } from "@/libraries/sharedTypes";

type CreateUpsellType = {
  price: string;
  salePrice: string;
  mainImage: string;
};

type EditUpsell = {
  id: string;
  price?: string;
  salePrice?: string;
  mainImage?: string;
  visibility?: string;
};

export async function CreateUpsellAction(data: CreateUpsellType) {
  try {
    const documentRef = doc(database, "upsells", generateId());
    const currentTime = currentTimestamp();

    const upsell = {
      price: data.price,
      salePrice: data.salePrice,
      mainImage: data.mainImage,
      visibility: "DRAFT",
      updatedAt: currentTime,
      createdAt: currentTime,
    };

    await setDoc(documentRef, upsell);
    revalidatePath("/admin/shop/upsells");

    return { type: AlertMessageType.SUCCESS, message: "Upsell created successfully" };
  } catch (error) {
    console.error("Error creating upsell:", error);
    return { type: AlertMessageType.ERROR, message: "Failed to create upsell" };
  }
}

export async function UpdateUpsellAction(data: EditUpsell) {
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

    return { type: AlertMessageType.SUCCESS, message: "Upsell updated successfully" };
  } catch (error) {
    console.error("Error updating upsell:", error);
    return { type: AlertMessageType.ERROR, message: "Failed to update upsell" };
  }
}
