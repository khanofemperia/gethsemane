"use server";

import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import {
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
  doc,
  runTransaction,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/firebase";
import { generateId } from "@/lib/utils";
import { AlertMessageType } from "@/lib/sharedTypes";

export async function AddToCartAction(data: {
  type: "product" | "upsell";
  baseProductId?: string;
  size?: string;
  color?: string;
  upsellId?: string;
  products?: Array<{ baseProductId: string; size: string; color: string }>;
}) {
  const generateNewCart = async () => {
    try {
      const newDeviceIdentifier = nanoid();

      cookies().set({
        name: "device_identifier",
        value: newDeviceIdentifier,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // expires in 30 days
      });

      const newCartData = {
        device_identifier: newDeviceIdentifier,
        products:
          data.type === "product"
            ? [
                {
                  baseProductId: data.baseProductId,
                  size: data.size,
                  color: data.color,
                  variantId: generateId(),
                },
              ]
            : data.products?.map((product) => ({
                ...product,
                variantId: generateId(),
              })) || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const newCartDocRef = doc(collection(database, "carts"), generateId());

      await runTransaction(database, async (transaction) => {
        transaction.set(newCartDocRef, newCartData);
      });

      revalidatePath("/");
      revalidatePath("/[slug]", "page");

      return {
        type: AlertMessageType.SUCCESS,
        message: "Item added to cart",
      };
    } catch (error) {
      console.error("Error generating new cart:", error);
      return {
        type: AlertMessageType.ERROR,
        message: "Please reload the page and try again",
      };
    }
  };

  const deviceIdentifier = cookies().get("device_identifier")?.value;

  if (!deviceIdentifier) {
    return await generateNewCart();
  }

  try {
    const collectionRef = collection(database, "carts");
    const snapshot = await getDocs(
      query(collectionRef, where("device_identifier", "==", deviceIdentifier))
    );

    if (snapshot.empty) {
      return await generateNewCart();
    } else {
      const cartDoc = snapshot.docs[0].ref;
      const existingProducts = snapshot.docs[0].data().products;

      if (data.type === "product") {
        const productExists = existingProducts.some(
          (product: { baseProductId: string; size: string; color: string }) =>
            product.baseProductId === data.baseProductId &&
            product.size === data.size &&
            product.color === data.color
        );

        if (productExists) {
          return {
            type: AlertMessageType.ERROR,
            message: "Item already in cart",
          };
        } else {
          existingProducts.push({
            baseProductId: data.baseProductId,
            size: data.size,
            color: data.color,
            variantId: generateId(),
          });
        }
      } else if (data.type === "upsell" && data.products) {
        existingProducts.push(
          ...data.products.map((product) => ({
            baseProductId: product.baseProductId,
            size: product.size,
            color: product.color,
            variantId: generateId(),
          }))
        );
      }

      await runTransaction(database, async (transaction) => {
        transaction.update(cartDoc, {
          products: existingProducts,
          updatedAt: serverTimestamp(),
        });
      });

      revalidatePath("/");
      revalidatePath("/[slug]", "page");

      return {
        type: AlertMessageType.SUCCESS,
        message: "Item added to cart",
      };
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Please reload the page and try again",
    };
  }
}

export async function RemoveFromCartAction({
  variantId,
}: {
  variantId: string;
}) {
  const deviceIdentifier = cookies().get("device_identifier")?.value;

  if (!deviceIdentifier) {
    return {
      type: AlertMessageType.ERROR,
      message: "Cart not found",
    };
  }

  try {
    const collectionRef = collection(database, "carts");
    const snapshot = await getDocs(
      query(collectionRef, where("device_identifier", "==", deviceIdentifier))
    );

    if (snapshot.empty) {
      return {
        type: AlertMessageType.ERROR,
        message: "Cart not found",
      };
    }

    const cartDoc = snapshot.docs[0].ref;
    const existingProducts = snapshot.docs[0].data().products;

    const updatedProducts = existingProducts.filter(
      (product: { variantId: string }) => product.variantId !== variantId
    );

    await runTransaction(database, async (transaction) => {
      transaction.update(cartDoc, {
        products: updatedProducts,
        updatedAt: serverTimestamp(),
      });
    });

    revalidatePath("/cart");

    return {
      type: AlertMessageType.SUCCESS,
      message: "Item removed from cart",
    };
  } catch (error) {
    console.error("Error removing product from cart:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Please reload the page and try again",
    };
  }
}
