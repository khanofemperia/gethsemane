"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useQuickviewStore } from "@/zustand/website/quickviewStore";
// import ProductImages from "../ProductImages";
// import SpecialOffer from "../SpecialOffer";
// import ProductOptions from "../Product/ProductOptions";
import { CloseIcon } from "@/icons";
import { getProductWithUpsell } from "@/lib/getData";

type ProductType = {
  id: string;
  name: string;
  slug: string;
  description: string;
  highlights: {
    headline: string;
    keyPoints: { index: number; text: string }[];
  };
  pricing: {
    salePrice: number;
    basePrice: number;
    discountPercentage: number;
  };
  images: {
    main: string;
    gallery: string[];
  };
  options: {
    colors: Array<{
      name: string;
      image: string;
    }>;
    sizes: {
      inches: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
      centimeters: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
    };
  };
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      salePrice: number;
      basePrice: number;
      discountPercentage: number;
    };
    visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
    createdAt: string;
    updatedAt: string;
    products: {
      id: string;
      name: string;
      slug: string;
      mainImage: string;
      basePrice: number;
    }[];
  };
};

export function QuickviewButton({
  productId,
  onClick,
}: {
  productId: string;
  onClick?: (event: React.MouseEvent) => void;
}) {
  const { showOverlay } = useQuickviewStore();
  const setSelectedProduct = useQuickviewStore(
    (state) => state.setSelectedProduct
  );

  const handleClick = async (event: React.MouseEvent) => {
    if (onClick) {
      event.stopPropagation();
      onClick(event);
    }

    try {
      const product = (await getProductWithUpsell({
        id: productId,
      })) as ProductType;

      const isInCart = false;
      const productInCart = null;

      setSelectedProduct(product, isInCart, productInCart);
      showOverlay();
    } catch (error) {
      console.error("Error checking cart:", error);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="outline-none border-none rounded-full w-[44px] h-7 flex items-center justify-center relative before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-0 before:right-0 before:border before:border-black before:rounded-full before:transition before:duration-100 before:ease-in-out active:before:scale-105 lg:hover:before:scale-105"
    >
      <Image
        src="/images/other/cart_plus.svg"
        alt="Add to cart"
        width={20}
        height={20}
        priority={true}
      />
    </button>
  );
}

export function QuickviewOverlay() {
  const { hideOverlay } = useQuickviewStore();

  const { isQuickviewOpen } = useQuickviewStore((state) => ({
    isQuickviewOpen: state.isVisible,
  }));

  const { isInCart, productInCart, selectedProduct, setSelectedProduct } =
    useQuickviewStore((state) => ({
      selectedProduct: state.selectedProduct,
      setSelectedProduct: state.setSelectedProduct,
      isInCart: state.isInCart,
      productInCart: state.productInCart,
    }));

  useEffect(() => {
    console.log("In quickview overlay");
    console.log(selectedProduct);
    if (isQuickviewOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isQuickviewOpen]);

  const isVisible = isQuickviewOpen && selectedProduct;

  return (
    isVisible && (
      <div className="custom-scrollbar flex justify-center py-20 w-screen h-screen overflow-x-hidden overflow-y-visible z-20 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
        <div className="w-max max-h-[554px] py-5 absolute top-16 bottom-16 bg-white mx-auto shadow rounded-14px">
          {/* <div className="px-10 flex flex-row custom-scrollbar max-h-[554px] h-full overflow-x-hidden overflow-y-visible">
            <div className="w-[582px]">
              <ProductImages
                images={selectedProduct.images}
                mainImage={selectedProduct.mainImage}
                name={selectedProduct.name}
              />
              {selectedProduct.description && (
                <div className="w-full mt-[22px] p-5 rounded-[24px] bg-gray text-xl">
                  <div
                    id="product-description"
                    className={styles.description}
                    dangerouslySetInnerHTML={{
                      __html: selectedProduct.description || "",
                    }}
                  />
                </div>
              )}
            </div>
            <div className="w-[394px] mt-[18px] ml-5 flex flex-col gap-8">
              <p className="mt-[-6px]">{selectedProduct.name}</p>
              <ProductOptions
                cartInfo={{
                  isInCart,
                  productInCart,
                }}
                productInfo={{
                  id: selectedProduct.id,
                  price: selectedProduct.price,
                  colors: selectedProduct.colors,
                  sizeChart: selectedProduct.sizes,
                }}
              />
              <SpecialOffer />
            </div>
          </div> */}
          <button
            onClick={hideOverlay}
            className="h-9 w-9 rounded-full absolute right-3 top-2 flex items-center justify-center transition duration-300 ease-in-out hover:bg-lightgray"
            type="button"
          >
            <CloseIcon size={24} />
          </button>
        </div>
      </div>
    )
  );
}
