"use server";

import { collection, getDocs, query } from "firebase/firestore";
import { database } from "@/lib/firebase";

export async function getOrders(): Promise<OrderType[] | null> {
  const collectionRef = collection(database, "orders");

  const firestoreQuery = query(collectionRef);
  const snapshot = await getDocs(firestoreQuery);

  if (snapshot.empty) {
    return null;
  }

  const orders = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    } as OrderType;
  });

  return orders;
}
