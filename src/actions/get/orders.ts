"use server";

import { collection, getDocs, query } from "firebase/firestore";
import { database } from "@/lib/firebase";

/**
 * Retrieve all orders from the database.
 *
 * @example Get all orders
 * const orders = await getOrders();
 *
 * @returns {Promise<OrderType[] | null>} A list of orders or `null` if no orders are found.
 */
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
