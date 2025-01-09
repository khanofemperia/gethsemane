"use server";

import { database } from "@/lib/firebase";
import {
  setDoc,
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { generateId, currentTimestamp } from "@/lib/utils/common";
import { revalidatePath } from "next/cache";
import { AlertMessageType } from "@/lib/sharedTypes";

const BATCH_SIZE = 500; // Firestore batch limit

export async function CreateProductAction(data: CreateProductType) {
  try {
    const documentRef = doc(database, "products", generateId());
    const currentTime = currentTimestamp();

    const product = {
      name: data.name,
      slug: data.slug,
      category: data.category,
      description: "",
      highlights: {
        headline: "",
        keyPoints: [],
      },
      pricing: {
        basePrice: data.basePrice,
        salePrice: 0,
        discountPercentage: 0,
      },
      images: {
        main: data.mainImage,
        gallery: [],
      },
      options: {
        colors: [],
        sizes: {},
      },
      seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: [],
      },
      visibility: "DRAFT",
      createdAt: currentTime,
      updatedAt: currentTime,
      sourceInfo: {
        platform: "",
        url: "",
        storeId: "",
        storeName: "",
        storeUrl: "",
      },
      upsell: "",
    };

    await setDoc(documentRef, product);
    revalidatePath("/admin/products");

    return {
      type: AlertMessageType.SUCCESS,
      message: "Product created successfully",
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to create product",
    };
  }
}

export async function UpdateProductAction(
  data: {
    id: string;
    options?: Partial<ProductType["options"]>;
  } & Partial<Omit<ProductType, "options">>
) {
  try {
    const docRef = doc(database, "products", data.id);
    const docSnap = await getDoc(docRef);
    const currentProduct = docSnap.data() as ProductType;

    const updatedProduct = {
      ...currentProduct,
      ...data,
      options: {
        ...currentProduct.options,
        ...data.options,
      },
      updatedAt: currentTimestamp(),
    };

    await setDoc(docRef, updatedProduct);

    // Only proceed with upsell updates if pricing changed
    if (
      data.pricing &&
      (data.pricing.basePrice !== currentProduct.pricing.basePrice ||
        data.pricing.salePrice !== currentProduct.pricing.salePrice)
    ) {
      // Find all upsells containing this product
      const upsellsRef = collection(database, "upsells");
      const upsellsSnap = await getDocs(upsellsRef);
      
      const upsellsToUpdate: { id: string; products: UpsellType["products"]; currentPricing: PricingType }[] = [];
      
      upsellsSnap.docs.forEach(doc => {
        const upsell = doc.data() as UpsellType;
        if (upsell.products.some(product => product.id === data.id)) {
          const updatedProducts = upsell.products.map(product =>
            product.id === data.id
              ? { ...product, basePrice: Number(data.pricing!.basePrice) || 0 }
              : product
          );
          
          upsellsToUpdate.push({
            id: doc.id,
            products: updatedProducts,
            currentPricing: upsell.pricing
          });
        }
      });

      // Batch update upsells
      if (upsellsToUpdate.length > 0) {
        const batches = [];
        for (let i = 0; i < upsellsToUpdate.length; i += BATCH_SIZE) {
          batches.push(upsellsToUpdate.slice(i, i + BATCH_SIZE));
        }

        for (const batchItems of batches) {
          const batch = writeBatch(database);
          
          batchItems.forEach(({ id, products, currentPricing }) => {
            const newPricing = calculateUpsellPricing(products, currentPricing);
            batch.update(doc(database, "upsells", id), {
              products,
              pricing: newPricing,
              updatedAt: currentTimestamp(),
            });
          });

          await batch.commit();
        }
      }
    }

    // Revalidate paths
    const paths = [
      `/admin/products/${currentProduct.slug}-${currentProduct.id}`,
      "/admin/products",
      "/admin/upsells/[id]",
      "/admin/collections/[slug]",
      "/",
      `/${currentProduct.slug}-${currentProduct.id}`,
      "/collections/[slug]",
      "/categories/[slug]",
      "/cart",
      "/checkout"
    ];

    paths.forEach(path => revalidatePath(path));

    return {
      type: AlertMessageType.SUCCESS,
      message: "Product updated successfully",
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to update product",
    };
  }
}

export async function SetUpsellAction(data: {
  productId: string;
  upsellId: string;
}) {
  try {
    const [upsellDocSnap, productDocSnap] = await Promise.all([
      getDoc(doc(database, "upsells", data.upsellId)),
      getDoc(doc(database, "products", data.productId))
    ]);

    if (!upsellDocSnap.exists()) {
      return {
        type: AlertMessageType.ERROR,
        message: "Upsell not found",
      };
    }

    await updateDoc(doc(database, "products", data.productId), {
      upsell: data.upsellId,
    });

    // Revalidate paths
    const productData = productDocSnap.data() as ProductType;
    const paths = [
      `/admin/products/${productData.slug}-${productData.id}`,
      "/admin/products",
      "/admin/upsells/[id]",
      "/admin/collections/[slug]",
      "/",
      `/${productData.slug}-${productData.id}`,
      "/collections/[slug]",
      "/categories/[slug]",
      "/cart",
      "/checkout"
    ];

    paths.forEach(path => revalidatePath(path));

    return {
      type: AlertMessageType.SUCCESS,
      message: "Upsell set to product successfully",
    };
  } catch (error) {
    console.error("Error setting upsell to product:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to set upsell to product",
    };
  }
}

export async function RemoveUpsellAction(data: {
  productId: string;
}) {
  try {
    const productDocRef = doc(database, "products", data.productId);
    const productDocSnap = await getDoc(productDocRef);
    const productData = productDocSnap.data() as ProductType;

    await updateDoc(productDocRef, {
      upsell: "",
    });

    // Revalidate paths
    const paths = [
      `/admin/products/${productData.slug}-${productData.id}`,
      "/admin/products",
      "/admin/upsells/[id]",
      "/admin/collections/[slug]",
      "/",
      `/${productData.slug}-${productData.id}`,
      "/collections/[slug]",
      "/categories/[slug]",
      "/cart",
      "/checkout"
    ];

    paths.forEach(path => revalidatePath(path));

    return {
      type: AlertMessageType.SUCCESS,
      message: "Upsell removed successfully",
    };
  } catch (error) {
    console.error("Error removing upsell from product:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to remove upsell from product",
    };
  }
}

export async function DeleteProductAction(data: { id: string }) {
  try {
    const productDocRef = doc(database, "products", data.id);
    const productSnap = await getDoc(productDocRef);

    if (!productSnap.exists()) {
      return {
        type: AlertMessageType.ERROR,
        message: "Product not found",
      };
    }

    await deleteDoc(productDocRef);
    
    const paths = [
      "/admin/products",
      "/"
    ];
    
    paths.forEach(path => revalidatePath(path));

    return {
      type: AlertMessageType.SUCCESS,
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to delete product",
    };
  }
}

// -- Logic & Utilities --

function calculateUpsellPricing(
  products: UpsellType["products"],
  currentPricing: PricingType
): PricingType {
  const totalBasePrice = products.reduce(
    (total, product) => total + (Number(product.basePrice) || 0),
    0
  );

  const roundedBasePrice = Math.floor(totalBasePrice) + 0.99;
  const basePrice = Number(roundedBasePrice.toFixed(2));

  const discountPercentage = currentPricing.discountPercentage ?? 0;

  let salePrice = 0;
  if (discountPercentage > 0) {
    const rawSalePrice = basePrice * (1 - discountPercentage / 100);
    const roundedSalePrice = Math.floor(rawSalePrice) + 0.99;
    salePrice = Number(roundedSalePrice.toFixed(2));
  }

  return {
    basePrice,
    salePrice,
    discountPercentage,
  };
}

// -- Type Definitions --

type CreateProductType = {
  name: string;
  slug: string;
  category: string;
  basePrice: string;
  mainImage: string;
};