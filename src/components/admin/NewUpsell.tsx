"use client";

import { CreateUpsellAction } from "@/actions/upsells";
import AlertMessage from "@/components/shared/AlertMessage";
import { formatThousands, isValidRemoteImage } from "@/lib/utils";
import { useState, useEffect } from "react";
import GraySpinner from "@/ui/Spinners/Gray";
import WhiteSpinner from "@/ui/Spinners/White";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { useNavbarMenuStore } from "@/zustand/admin/navbarMenuStore";
import { ArrowLeftIcon, CloseIcon, PlusIcon } from "@/icons";
import clsx from "clsx";
import Image from "next/image";
import Overlay from "@/ui/Overlay";
import { AlertMessageType } from "@/lib/sharedTypes";
import { getProduct } from "@/lib/getData";
import Link from "next/link";

type ProductType = {
  index: number;
  id: string;
  slug: string;
  name: string;
  mainImage: string;
  basePrice: number;
};

export function NewUpsellMenuButton() {
  const { showOverlay } = useOverlayStore();
  const { setNavbarMenu } = useNavbarMenuStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.upsells.name,
    overlayName: state.pages.upsells.overlays.newUpsell.name,
  }));

  const openOverlay = () => {
    setNavbarMenu(false);
    showOverlay({ pageName, overlayName });
  };

  return (
    <button
      type="button"
      className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray"
      onClick={openOverlay}
    >
      New upsell
    </button>
  );
}

export function NewUpsellEmptyGridButton() {
  const { showOverlay } = useOverlayStore();
  const { setNavbarMenu } = useNavbarMenuStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.upsells.name,
    overlayName: state.pages.upsells.overlays.newUpsell.name,
  }));

  const openOverlay = () => {
    setNavbarMenu(false);
    showOverlay({ pageName, overlayName });
  };

  return (
    <button
      type="button"
      className="h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue active:bg-blue-dimmed lg:hover:bg-blue-dimmed"
      onClick={openOverlay}
    >
      New upsell
    </button>
  );
}

export function NewUpsellOverlay() {
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    basePrice: "",
    mainImage: "",
  });
  const [productId, setProductId] = useState<string>("");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [basePrice, setBasePrice] = useState(0);

  const { hideOverlay } = useOverlayStore();

  const { pageName, isOverlayVisible, overlayName } = useOverlayStore(
    (state) => ({
      pageName: state.pages.upsells.name,
      overlayName: state.pages.upsells.overlays.newUpsell.name,
      isOverlayVisible: state.pages.upsells.overlays.newUpsell.isVisible,
    })
  );

  useEffect(() => {
    if (isOverlayVisible || showAlert) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      if (!isOverlayVisible && !showAlert) {
        document.body.style.overflow = "visible";
      }
    };
  }, [isOverlayVisible, showAlert]);

  useEffect(() => {
    const totalBasePrice = products.reduce(
      (total, product) => total + product.basePrice,
      0
    );
    setBasePrice(totalBasePrice);
  }, [products]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (
      (name === "basePrice" && !/^\d*\.?\d*$/.test(value)) ||
      (name === "salePrice" && !/^\d*\.?\d*$/.test(value))
    ) {
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoadingSave(true);

    try {
      const result = await CreateUpsellAction(formData);
      setAlertMessageType(result.type);
      setAlertMessage(result.message);
      setShowAlert(true);
    } catch (error) {
      console.error("Error creating upsell:", error);
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Failed to create upsell");
      setShowAlert(true);
    } finally {
      setLoadingSave(false);
      onHideOverlay();
    }
  };

  const onHideOverlay = () => {
    setLoadingSave(false);
    hideOverlay({ pageName, overlayName });
    setFormData({
      basePrice: "",
      mainImage: "",
    });
  };

  const hideAlertMessage = () => {
    setShowAlert(false);
    setAlertMessage("");
    setAlertMessageType(AlertMessageType.NEUTRAL);
  };

  const addProduct = async (productId: string) => {
    const trimmedProductId = productId.trim();

    if (!trimmedProductId) {
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Product ID cannot be empty");
      setShowAlert(true);
      return;
    } else if (!/^\d{5}$/.test(trimmedProductId)) {
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Product ID must be a 5-digit number");
      setShowAlert(true);
      return;
    }

    if (products.some((product) => product.id === trimmedProductId)) {
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Product already added");
      setShowAlert(true);
      return;
    }

    setLoadingProduct(true);

    try {
      const product = await getProduct({
        id: trimmedProductId,
        fields: ["id", "name", "slug", "images", "pricing"],
      });

      if (product) {
        const newProduct = {
          index: products.length,
          id: product.id,
          slug: product.slug,
          name: product.name,
          mainImage: product.images?.main ?? "",
          basePrice: product.pricing?.basePrice ?? 0,
        };

        setProducts((prevProducts) => [
          ...prevProducts,
          newProduct as ProductType,
        ]);
        setProductId(""); // Clear input field after adding
      } else {
        setAlertMessageType(AlertMessageType.ERROR);
        setAlertMessage("Product not found");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Failed to add product");
      setShowAlert(true);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      addProduct(productId);
    }
  };

  const handleProductIdInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setProductId(value);
    }
  };

  const handleButtonClick = () => {
    addProduct(productId);
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">New upsell</h2>
                  <button
                    onClick={onHideOverlay}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={onHideOverlay}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray"
                >
                  <ArrowLeftIcon className="fill-blue -ml-[2px]" size={20} />
                  <span className="font-semibold text-sm text-blue">
                    New upsell
                  </span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loadingSave}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue",
                    {
                      "bg-opacity-50": loadingSave,
                      "active:bg-blue-dimmed": !loadingSave,
                    }
                  )}
                >
                  {loadingSave ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <WhiteSpinner />
                      <span className="text-white">Saving</span>
                    </div>
                  ) : (
                    <span className="text-white">Save</span>
                  )}
                </button>
              </div>
              <div className="w-full h-full mt-[52px] md:mt-0 px-5 pt-5 pb-28 md:pb-10 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-sm">Products</span>
                  <div className="w-full min-[588px]:w-56 h-9 rounded-full overflow-hidden flex items-center border shadow-sm">
                    <input
                      type="text"
                      value={productId}
                      onChange={handleProductIdInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Paste ID (#12345)"
                      className="h-full w-full pl-4 bg-transparent"
                    />
                    <div className="h-full flex items-center justify-center">
                      <button
                        onClick={handleButtonClick}
                        disabled={loadingProduct}
                        className={clsx(
                          "w-11 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out",
                          {
                            "active:bg-lightgray lg:hover:bg-lightgray":
                              !loadingProduct,
                          }
                        )}
                      >
                        {loadingProduct ? (
                          <GraySpinner />
                        ) : (
                          <PlusIcon size={22} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="w-full max-w-[383px] border rounded-md overflow-hidden">
                    {products.length > 0 ? (
                      <div className="p-5 flex flex-wrap justify-start">
                        {products
                          .slice(0, 3)
                          .map(
                            ({
                              index,
                              id,
                              slug,
                              mainImage,
                              name,
                              basePrice,
                            }) => (
                              <Link
                                key={index}
                                href={`/admin/shop/products/${slug}-${id}`}
                                target="_blank"
                                className="aspect-square w-1/2 pt-2 pb-[6px] px-5 select-none transition duration-200 ease-in-out active:bg-blue-100 lg:hover:bg-blue-100"
                              >
                                <div className="relative w-full h-full">
                                  <div className="aspect-square w-full overflow-hidden flex items-center justify-center shadow-[2px_2px_4px_#9E9E9E] bg-white">
                                    <Image
                                      src={mainImage}
                                      alt={name}
                                      width={216}
                                      height={216}
                                      priority
                                    />
                                  </div>
                                  <div className="flex items-center justify-center absolute bottom-0 text-sm w-full">
                                    <span className="font-bold">
                                      ${formatThousands(basePrice)}
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            )
                          )}
                      </div>
                    ) : (
                      <span className="p-5 block text-xs text-gray">
                        No products yet
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-sm">Base price</span>
                  <div className="w-full h-9 px-3 flex items-center rounded-md transition duration-300 ease-in-out border">
                    {basePrice}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="mainImage" className="font-semibold text-sm">
                    Main image
                  </label>
                  <div>
                    <div className="w-full max-w-[383px] border rounded-md overflow-hidden">
                      <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
                        {formData.mainImage &&
                          isValidRemoteImage(formData.mainImage) && (
                            <Image
                              src={formData.mainImage}
                              alt="Upsell"
                              width={383}
                              height={383}
                              priority
                            />
                          )}
                      </div>
                      <div className="w-full h-9 border-t overflow-hidden">
                        <input
                          type="text"
                          name="mainImage"
                          placeholder="Paste image URL"
                          value={formData.mainImage}
                          onChange={handleInputChange}
                          className="h-full w-full px-3 text-gray"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0">
              <button
                onClick={handleSave}
                disabled={loadingSave}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue",
                  {
                    "bg-opacity-50": loadingSave,
                    "active:bg-blue-dimmed": !loadingSave,
                  }
                )}
              >
                {loadingSave ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <WhiteSpinner />
                    <span className="text-white">Saving</span>
                  </div>
                ) : (
                  <span className="text-white">Save</span>
                )}
              </button>
            </div>
          </div>
        </Overlay>
      )}
      {showAlert && (
        <AlertMessage
          message={alertMessage}
          hideAlertMessage={hideAlertMessage}
          type={alertMessageType}
        />
      )}
    </>
  );
}
