"use server";

import { database } from "@/lib/firebase";
import {
  setDoc,
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { generateId, currentTimestamp } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { AlertMessageType } from "@/lib/sharedTypes";

type CreateProductType = {
  name: string;
  slug: string;
  category: string;
  basePrice: string;
  mainImage: string;
};

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

    revalidatePath("/admin/shop/products");

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

    if (
      data.pricing &&
      (data.pricing.basePrice !== currentProduct.pricing.basePrice ||
        data.pricing.salePrice !== currentProduct.pricing.salePrice)
    ) {
      const upsellsRef = collection(database, "upsells");
      const upsellsSnap = await getDocs(upsellsRef);

      for (const upsellDoc of upsellsSnap.docs) {
        const upsell = upsellDoc.data() as UpsellType;
        if (upsell.products.some((product) => product.id === data.id)) {
          const updatedUpsellProducts = upsell.products.map((product) =>
            product.id === data.id
              ? {
                  ...product,
                  basePrice: Number(data.pricing!.basePrice) || 0,
                }
              : product
          );

          const newUpsellPricing = calculateUpsellPricing(
            updatedUpsellProducts,
            upsell.pricing
          );

          await updateDoc(doc(database, "upsells", upsell.id), {
            products: updatedUpsellProducts,
            pricing: newUpsellPricing,
            updatedAt: currentTimestamp(),
          });
        }
      }
    }

    // Revalidate paths to update collections data
    revalidatePath(`/admin/shop/collections/${currentProduct.slug}-${currentProduct.id}`); // Admin edit product page
    revalidatePath("/admin/shop/products"); // Admin products page
    revalidatePath("/admin/shop/upsells/[id]", "page"); // Admin edit upsell page
    revalidatePath("/"); // Public main page
    revalidatePath(`/collections/[slug]`, 'page'); // Public single collection page
    revalidatePath(`/${currentProduct.slug}-${currentProduct.id`); // Public product details page
    revalidatePath('/categories/[slug]', 'page'); // Public single category page
    revalidatePath('/cart'); // Public cart page
    revalidatePath('/checkout'); // Public checkout page
    
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
    const upsellDocRef = doc(database, "upsells", data.upsellId);
    const upsellDocSnap = await getDoc(upsellDocRef);

    if (!upsellDocSnap.exists()) {
      return {
        type: AlertMessageType.ERROR,
        message: "Upsell not found",
      };
    }

    const productDocRef = doc(database, "products", data.productId);
    await updateDoc(productDocRef, {
      upsell: data.upsellId,
    });

    revalidatePath("/admin/shop/products/[slug]", "page");

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

export async function RemoveUpsellAction(data: { productId: string }) {
  try {
    const productDocRef = doc(database, "products", data.productId);
    await updateDoc(productDocRef, {
      upsell: "",
    });

    revalidatePath("/admin/shop/products/[slug]", "page");

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
