import { doc, getDoc, setDoc } from "firebase/firestore";
import { database } from "@/lib/firebase";

type VisibilityFilterType = {
  visibility?: "VISIBLE" | "HIDDEN";
};

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

const defaultCategories: CategoryType[] = [
  {
    index: 0,
    name: "Dresses",
    image: "dresses.png",
    visibility: "HIDDEN",
  },
  { index: 1, name: "Tops", image: "tops.png", visibility: "HIDDEN" },
  {
    index: 2,
    name: "Bottoms",
    image: "bottoms.png",
    visibility: "HIDDEN",
  },
  {
    index: 3,
    name: "Outerwear",
    image: "outerwear.png",
    visibility: "HIDDEN",
  },
  {
    index: 4,
    name: "Shoes",
    image: "shoes.png",
    visibility: "HIDDEN",
  },
  {
    index: 5,
    name: "Accessories",
    image: "accessories.png",
    visibility: "HIDDEN",
  },
  { index: 6, name: "Men", image: "men.png", visibility: "HIDDEN" },
];

export async function getCategories(
  filter?: VisibilityFilterType
): Promise<StoreCategoriesType | null> {
  const categoriesRef = doc(database, "categories", "storeCategories");
  const categoriesDoc = await getDoc(categoriesRef);

  if (!categoriesDoc.exists()) {
    // If document doesn't exist, create it with default categories
    const newCategoriesDoc: StoreCategoriesType = {
      showOnPublicSite: false,
      categories: defaultCategories,
    };

    await setDoc(categoriesRef, newCategoriesDoc);

    // Return filtered or all categories with proper structure
    return {
      showOnPublicSite: false,
      categories: filter?.visibility
        ? defaultCategories.filter(
            (category) => category.visibility === filter.visibility
          )
        : defaultCategories,
    };
  }

  const data = categoriesDoc.data() as StoreCategoriesType;
  let existingCategories = [...data.categories];

  // Check for missing default categories and add them
  const existingNames = new Set(
    existingCategories.map((category) => category.name)
  );
  const categoriesToAdd = defaultCategories.filter(
    (category) => !existingNames.has(category.name)
  );

  // Check for categories that need updating
  const categoriesToUpdate = defaultCategories.filter((defaultCategory) => {
    const existingCategory = existingCategories.find(
      (cat) => cat.name === defaultCategory.name
    );
    return (
      existingCategory &&
      (existingCategory.index !== defaultCategory.index ||
        existingCategory.image !== defaultCategory.image)
    );
  });

  // If we need to make any changes, update the document
  if (categoriesToAdd.length > 0 || categoriesToUpdate.length > 0) {
    // Remove categories that need updating
    existingCategories = existingCategories.filter(
      (category) =>
        !categoriesToUpdate.some(
          (updateCategory) => updateCategory.name === category.name
        )
    );

    // Add new and updated categories
    existingCategories = [
      ...existingCategories,
      ...categoriesToAdd,
      ...categoriesToUpdate,
    ];

    existingCategories.sort((a, b) => a.index - b.index);

    await setDoc(categoriesRef, {
      showOnPublicSite: data.showOnPublicSite,
      categories: existingCategories,
    });
  }

  if (existingCategories.length === 0) {
    return null;
  }

  return {
    showOnPublicSite: data.showOnPublicSite,
    categories: filter?.visibility
      ? existingCategories.filter(
          (category) => category.visibility === filter.visibility
        )
      : existingCategories,
  };
}
