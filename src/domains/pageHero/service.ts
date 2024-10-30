import { database } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

type PageHeroType = {
  id: string;
  images: {
    desktop: string;
    mobile: string;
  };
  title: string;
  destinationUrl: string;
  visibility: "VISIBLE" | "HIDDEN";
};

export async function getPageHero(): Promise<PageHeroType> {
  const documentRef = doc(database, "pageHero", "homepageHero");
  const snapshot = await getDoc(documentRef);

  const defaultPageHero: Omit<PageHeroType, "id"> = {
    images: {
      desktop: "",
      mobile: "",
    },
    title: "",
    destinationUrl: "",
    visibility: "HIDDEN",
  };

  if (!snapshot.exists()) {
    await setDoc(documentRef, defaultPageHero);
    return { id: documentRef.id, ...defaultPageHero };
  }

  return { id: snapshot.id, ...(snapshot.data() as Omit<PageHeroType, "id">) };
}
