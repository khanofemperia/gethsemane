import { doc, updateDoc } from "firebase/firestore";
import { database } from "@/lib/firebase";
import { AlertMessageType } from "@/lib/sharedTypes";

type CategoryType = {
  index: number;
  name: string;
  image: string;
  visibility: "VISIBLE" | "HIDDEN";
};

type StoreCategoriesType = {
  showOnPublicSite: boolean;
  categories: CategoryType[];
};

export async function UpdateCategoriesAction(data: StoreCategoriesType) {
  try {
    const categoriesRef = doc(database, "categories", "storeCategories");

    const updates = {
      showOnPublicSite: data.showOnPublicSite,
      categories: data.categories,
    };

    await updateDoc(categoriesRef, updates);

    return {
      type: AlertMessageType.SUCCESS,
      message: "Categories updated successfully",
    };
  } catch (error) {
    console.error("Error updating categories:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to update categories",
    };
  }
}
