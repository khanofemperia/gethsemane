"use server";

import { doc, updateDoc } from "firebase/firestore";
import { database } from "@/lib/firebase";
import { revalidatePath } from "next/cache";
import { AlertMessageType } from "@/lib/sharedTypes";

export async function UpdatePageHeroAction(data: Partial<PageHeroType>) {
  try {
    const { ...updatedPageHeroData } = data;

    const documentRef = doc(database, "pageHero", "homepageHero");
    await updateDoc(documentRef, updatedPageHeroData);

    revalidatePath("/admin/shop");

    return {
      type: AlertMessageType.SUCCESS,
      message: "Page hero updated successfully",
    };
  } catch (error) {
    console.error("Error updating page hero:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to update page hero",
    };
  }
}
