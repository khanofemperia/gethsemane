"use server";

import { database } from "@/lib/firebase";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { generateId, currentTimestamp } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { AlertMessageType } from "@/lib/sharedTypes";

export async function CreateUpsellAction(data: Partial<UpsellType>) {
  try {
    const documentRef = doc(database, "upsells", generateId());
    const currentTime = currentTimestamp();

    const upsell = {
      ...data,
      visibility: "DRAFT",
      updatedAt: currentTime,
      createdAt: currentTime,
    };

    await setDoc(documentRef, upsell);
    revalidatePath("/admin/shop/upsells");

    return {
      type: AlertMessageType.SUCCESS,
      message: "Upsell created successfully",
    };
  } catch (error) {
    console.error("Error creating upsell:", error);
    return { type: AlertMessageType.ERROR, message: "Failed to create upsell" };
  }
}

export async function UpdateUpsellAction(
  data: {
    id: string;
  } & Partial<ProductType>
) {
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

    return {
      type: AlertMessageType.SUCCESS,
      message: "Upsell updated successfully",
    };
  } catch (error) {
    console.error("Error updating upsell:", error);
    return { type: AlertMessageType.ERROR, message: "Failed to update upsell" };
  }
}

export async function AddProductAction(data: {
  upsellId: string;
  productId: string;
}) {
  try {
    const { upsellId, productId } = data;
    const productRef = doc(database, "products", productId);
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) {
      return { type: AlertMessageType.ERROR, message: "Product not found" };
    }

    const upsellRef = doc(database, "upsells", upsellId);
    const upsellSnapshot = await getDoc(upsellRef);

    if (!upsellSnapshot.exists()) {
      return {
        type: AlertMessageType.ERROR,
        message: "Upsell not found",
      };
    }

    const newProduct = {
      index: 1,
      id: productId,
      slug: productSnapshot.data()?.slug || "",
      name: productSnapshot.data()?.name || "",
      mainImage: productSnapshot.data()?.images.main || "",
      basePrice: Number(productSnapshot.data()?.pricing.basePrice) || 0,
    };

    const upsellData = upsellSnapshot.data() as UpsellType;

    const upsellProducts = upsellData.products;

    // Check if the product is already in the upsell
    const productAlreadyExists = upsellProducts.some(
      (product) => product.id === productId
    );

    if (productAlreadyExists) {
      return {
        type: AlertMessageType.ERROR,
        message: "Product already in the upsell",
      };
    }

    upsellProducts.sort((a, b) => a.index - b.index);

    // Update the indexes of existing products
    const updatedProducts = upsellProducts.map((product, index) => ({
      ...product,
      index: index + 2,
      basePrice: Number(product.basePrice),
    }));

    // Add the new product at the beginning of the array
    updatedProducts.unshift(newProduct);

    // Calculate new base price
    const totalBasePrice = updatedProducts.reduce(
      (total, product) => total + product.basePrice,
      0
    );
    const roundedBasePrice =
      totalBasePrice === 0 ? 0 : Math.floor(totalBasePrice) + 0.99;
    const formattedBasePrice = Number(roundedBasePrice.toFixed(2));

    // Calculate new sale price
    const discountPercentage = upsellData.pricing.discountPercentage || 0;
    const rawSalePrice = formattedBasePrice * (1 - discountPercentage / 100);
    const roundedSalePrice =
      rawSalePrice === 0 ? 0 : Math.floor(rawSalePrice) + 0.99;
    const salePrice = Number(roundedSalePrice.toFixed(2));

    await updateDoc(upsellRef, {
      products: updatedProducts,
      "pricing.basePrice": formattedBasePrice,
      "pricing.salePrice": salePrice,
      updatedAt: currentTimestamp(),
    });

    revalidatePath("/admin/shop/upsells/[slug]", "page");

    return {
      type: AlertMessageType.SUCCESS,
      message: "Product added to upsell successfully",
    };
  } catch (error) {
    console.error("Error adding product to upsell:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to add product to upsell",
    };
  }
}

export async function RemoveProductAction(data: {
  upsellId: string;
  productId: string;
}) {
  try {
    const { upsellId, productId } = data;
    const productRef = doc(database, "products", productId);
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) {
      return { type: AlertMessageType.ERROR, message: "Product not found" };
    }

    const upsellRef = doc(database, "upsells", upsellId);
    const upsellSnapshot = await getDoc(upsellRef);

    if (!upsellSnapshot.exists()) {
      return {
        type: AlertMessageType.ERROR,
        message: "Upsell not found",
      };
    }

    const upsellData = upsellSnapshot.data() as UpsellType;

    if (upsellData.products.length === 1) {
      return {
        type: AlertMessageType.ERROR,
        message: "Cannot remove the last product from the upsell",
      };
    }

    const updatedProducts = upsellData.products
      .filter((product) => product.id !== productId)
      .map((product, index) => ({
        ...product,
        index: index + 1,
        basePrice: Number(product.basePrice),
      }));

    // Calculate new base price
    const totalBasePrice = updatedProducts.reduce(
      (total, product) => total + product.basePrice,
      0
    );
    const roundedBasePrice =
      totalBasePrice === 0 ? 0 : Math.floor(totalBasePrice) + 0.99;
    const formattedBasePrice = Number(roundedBasePrice.toFixed(2));

    // Calculate new sale price
    const discountPercentage = upsellData.pricing.discountPercentage || 0;
    const rawSalePrice = formattedBasePrice * (1 - discountPercentage / 100);
    const roundedSalePrice =
      rawSalePrice === 0 ? 0 : Math.floor(rawSalePrice) + 0.99;
    const salePrice = Number(roundedSalePrice.toFixed(2));

    await updateDoc(upsellRef, {
      products: updatedProducts,
      "pricing.basePrice": formattedBasePrice,
      "pricing.salePrice": salePrice,
      updatedAt: currentTimestamp(),
    });

    revalidatePath("/admin/shop/upsells/[slug]", "page");

    return {
      type: AlertMessageType.SUCCESS,
      message: "Product removed from upsell successfully",
    };
  } catch (error) {
    console.error("Error removing product from upsell:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to remove product from upsell",
    };
  }
}

export async function UpdateProductNameAction(data: {
  upsellId: string;
  productId: string;
  name: string;
}) {
  try {
    const { upsellId, productId, name } = data;

    const upsellRef = doc(database, "upsells", upsellId);
    const upsellSnapshot = await getDoc(upsellRef);

    if (!upsellSnapshot.exists()) {
      return {
        type: AlertMessageType.ERROR,
        message: "Upsell not found",
      };
    }

    const upsellData = upsellSnapshot.data() as UpsellType;

    const updatedProducts = upsellData.products.map((product) =>
      product.id === productId ? { ...product, name: name } : product
    );

    await updateDoc(upsellRef, {
      products: updatedProducts,
      updatedAt: currentTimestamp(),
    });

    revalidatePath("/admin/shop/upsells/[slug]", "page");

    return {
      type: AlertMessageType.SUCCESS,
      message: "Product name updated successfully",
    };
  } catch (error) {
    console.error("Error updating product name:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to update product name",
    };
  }
}

export async function ChangeProductIndexAction(data: {
  upsellId: string;
  product: {
    id: string;
    index: number;
  };
}) {
  try {
    const { upsellId, product: productOneChanges } = data;
    const productOneChangesRef = doc(
      database,
      "products",
      productOneChanges.id
    );
    const productOneChangesSnapshot = await getDoc(productOneChangesRef);

    if (!productOneChangesSnapshot.exists()) {
      return { type: AlertMessageType.ERROR, message: "Product not found" };
    }

    const upsellRef = doc(database, "upsells", upsellId);
    const upsellSnapshot = await getDoc(upsellRef);

    if (!upsellSnapshot.exists()) {
      return {
        type: AlertMessageType.ERROR,
        message: "Upsell not found",
      };
    }

    const upsellData = upsellSnapshot.data() as UpsellType;

    if (
      isNaN(productOneChanges.index) ||
      productOneChanges.index < 1 ||
      productOneChanges.index > upsellData.products.length
    ) {
      return {
        type: AlertMessageType.ERROR,
        message: "Index is invalid or out of range",
      };
    }

    const productOne = upsellData.products.find(
      (item) => item.id === productOneChanges.id
    );

    const productOneIndexBeforeSwap = productOne?.index;

    const productTwo = upsellData.products.find(
      (item) => item.index === productOneChanges.index
    );

    if (!productTwo) {
      return {
        type: AlertMessageType.ERROR,
        message: "No product found to swap index with",
      };
    }

    if (productOne !== undefined && productOneIndexBeforeSwap !== undefined) {
      productOne.index = productOneChanges.index;
      productTwo.index = productOneIndexBeforeSwap;

      await updateDoc(upsellRef, {
        products: upsellData.products,
        updatedAt: currentTimestamp(),
      });

      revalidatePath("/admin/shop/upsells/[slug]", "page");

      return {
        type: AlertMessageType.SUCCESS,
        message: "Product index updated successfully",
      };
    } else {
      return {
        type: AlertMessageType.ERROR,
        message: "Failed to update product index",
      };
    }
  } catch (error) {
    console.error("Error updating product index:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to update product index",
    };
  }
}
