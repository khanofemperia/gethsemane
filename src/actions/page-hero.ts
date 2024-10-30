"use server";

import { doc, updateDoc } from "firebase/firestore";
import { database } from "@/lib/firebase";
import { revalidatePath } from "next/cache";
import { AlertMessageType } from "@/lib/sharedTypes";

export async function UpdatePageHeroAction(data: {
  images: {
    desktop: string;
    mobile: string;
  };
  title: string;
  destinationUrl: string;
  visibility: "VISIBLE" | "HIDDEN";
}) {
  try {
    const { ...updatedPageHeroData } = data;

    const documentRef = doc(database, "pageHero", "homepageHero");
    await updateDoc(documentRef, updatedPageHeroData);

    // Revalidate paths to update page hero data
    revalidatePath("/admin/shop"); // Admin shop page
    revalidatePath("/"); // Public main page

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
