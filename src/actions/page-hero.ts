"use server";

import { doc, updateDoc } from "firebase/firestore";
import { database } from "@/libraries/firebase";
import { revalidatePath } from "next/cache";
import { AlertMessageType } from "@/libraries/sharedTypes";

type PageHeroType = {
  images: {
    desktopImage: string | null;
    mobileImage: string | null;
  };
  title: string | null;
  destinationUrl: string | null;
  visibility: string;
};

export async function UpdatePageHeroAction(data: PageHeroType) {
  try {
    const { ...updatedPageHeroData } = data;

    const documentRef = doc(database, "pageHero", "storefrontHero");
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
