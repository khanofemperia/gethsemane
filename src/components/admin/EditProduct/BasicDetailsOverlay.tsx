"use client";

import AlertMessage from "@/components/shared/AlertMessage";
import { capitalizeFirstLetter } from "@/lib/utils";
import { FormEvent, useState, useEffect, useRef } from "react";
import Spinner from "@/ui/Spinners/White";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeftIcon, ChevronDownIcon, CloseIcon, EditIcon } from "@/icons";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { UpdateProductAction } from "@/actions/products";
import { AlertMessageType } from "@/lib/sharedTypes";
import { getCategories } from "@/lib/getData";

type DataType = {
  id: string;
  category: string;
  name: string;
  slug: string;
  pricing: {
    basePrice: number;
    salePrice?: number;
    discountPercentage?: number;
  };
};

export function BasicDetailsButton({ className }: { className: string }) {
  const { showOverlay } = useOverlayStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.editProduct.name,
    overlayName: state.pages.editProduct.overlays.basicDetails.name,
  }));

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray ${className}`}
    >
      <EditIcon size={20} />
    </button>
  );
}

export function BasicDetailsOverlay({ data }: { data: DataType }) {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );
  const [selectedCategory, setSelectedCategory] = useState(data.category);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [name, setName] = useState(data.name);
  const [slug, setSlug] = useState(data.slug);
  const [basePrice, setBasePrice] = useState(data.pricing.basePrice);
  const [salePrice, setSalePrice] = useState(data.pricing.salePrice || 0);
  const [discountPercentage, setDiscountPercentage] = useState(
    data.pricing.discountPercentage?.toString() || ""
  );

  const categoryRef = useRef<HTMLDivElement>(null);

  const { hideOverlay } = useOverlayStore();

  const { pageName, isOverlayVisible, overlayName } = useOverlayStore(
    (state) => ({
      pageName: state.pages.editProduct.name,
      overlayName: state.pages.editProduct.overlays.basicDetails.name,
      isOverlayVisible: state.pages.editProduct.overlays.basicDetails.isVisible,
    })
  );

  useEffect(() => {
    (async () => {
      try {
        const categories = (await getCategories()) as CategoryType[];
        setCategories(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setAlertMessageType(AlertMessageType.ERROR);
        setAlertMessage("Couldn't get categories. Please refresh the page.");
        setShowAlert(true);
      }
    })();
  }, []);

  useEffect(() => {
    calculateSalePrice(discountPercentage);
  }, [basePrice, discountPercentage]);

  const handleDiscountPercentageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setDiscountPercentage(value);
      calculateSalePrice(value);
    }
  };

  const calculateSalePrice = (discount: string) => {
    const discountValue = parseInt(discount, 10);

    if (isNaN(discountValue) || discountValue === 0) {
      setSalePrice(0);
    } else if (discountValue >= 0 && discountValue <= 100) {
      const rawSalePrice = basePrice * (1 - discountValue / 100);

      // Round down to the nearest .99
      const roundedSalePrice =
        rawSalePrice === 0 ? 0 : Math.floor(rawSalePrice) + 0.99;

      // Format to two decimal places
      const formattedSalePrice = Number(roundedSalePrice.toFixed(2));

      setSalePrice(formattedSalePrice);
    }
  };

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
    function handleClickOutside(event: MouseEvent) {
      if (!categoryRef.current || !(event.target instanceof Node)) {
        return;
      }

      const targetNode = categoryRef.current as Node;

      if (!targetNode.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
  };

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
  };

  const hideAlertMessage = () => {
    setShowAlert(false);
    setAlertMessage("");
    setAlertMessageType(AlertMessageType.NEUTRAL);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);

    const updatedData = {
      id: data.id,
      category: selectedCategory,
      name,
      slug,
      pricing: {
        basePrice,
        salePrice,
        discountPercentage: parseInt(discountPercentage, 10),
      },
    };

    try {
      const result = await UpdateProductAction(updatedData);
      setAlertMessageType(result.type);
      setAlertMessage(result.message);
      setShowAlert(true);
    } catch (error) {
      console.error("Error updating product:", error);
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Failed to update product");
      setShowAlert(true);
    } finally {
      setLoading(false);
      onHideOverlay();
    }
  };

  const handleSlugChange = (value: string) => {
    const sanitizedSlug = value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
    setSlug(sanitizedSlug);
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Basic details</h2>
                  <button
                    onClick={() => {
                      hideOverlay({ pageName, overlayName });
                    }}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={() => {
                    hideOverlay({ pageName, overlayName });
                  }}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                >
                  <ArrowLeftIcon className="fill-blue -ml-[2px]" size={20} />
                  <span className="font-semibold text-sm text-blue">
                    Basic details
                  </span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "active:bg-neutral-700/85": !loading,
                    }
                  )}
                >
                  {loading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner />
                      <span className="text-white">Saving</span>
                    </div>
                  ) : (
                    <span className="text-white">Save</span>
                  )}
                </button>
              </div>
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 pb-28 md:pb-10 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xs text-gray">Category</h2>
                  <div ref={categoryRef} className="w-full h-9 relative">
                    <button
                      onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                      type="button"
                      className="h-9 w-full px-3 rounded-md flex items-center justify-between transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                    >
                      <span
                        className={clsx({
                          "text-gray": selectedCategory === "Select",
                        })}
                      >
                        {selectedCategory}
                      </span>
                      <ChevronDownIcon
                        className="-mr-[4px] stroke-gray"
                        size={20}
                      />
                    </button>
                    <div
                      className={clsx("w-full absolute top-10 z-10", {
                        hidden: !isCategoryDropdownOpen,
                        block: isCategoryDropdownOpen,
                      })}
                    >
                      <div className="overflow-hidden h-full max-h-[228px] overflow-x-hidden overflow-y-visible custom-scrollbar w-full py-[6px] flex flex-col gap-0 rounded-md shadow-dropdown bg-white">
                        {categories.map((category, index) => (
                          <div
                            key={index}
                            className="w-full min-h-9 h-9 flex items-center px-[12px] cursor-context-menu transition duration-300 ease-in-out hover:bg-lightgray"
                            onClick={() => handleCategorySelect(category.name)}
                          >
                            {category.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs text-gray">
                    Name
                  </label>
                  <div className="w-full h-9 relative">
                    <input
                      type="text"
                      placeholder="Denim Mini Skirt"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="slug" className="text-xs text-gray">
                    Slug
                  </label>
                  <div className="w-full h-9 relative">
                    <input
                      type="text"
                      id="slug"
                      placeholder="denim-mini-skirt"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      required
                    />
                  </div>
                </div>
                <div className="w-full max-w-[300px]">
                  <h2 className="text-xs text-gray">Pricing</h2>
                  <div className="mt-2 flex flex-col gap-5 border rounded-md px-5 pt-4 pb-[22px]">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="basePrice" className="text-xs text-gray">
                        Base price
                      </label>
                      <div className="w-full h-9 relative">
                        <input
                          type="text"
                          id="basePrice"
                          placeholder="34.99"
                          value={basePrice}
                          onChange={(e) => setBasePrice(Number(e.target.value))}
                          className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-xs text-gray">Sale price</h2>
                      <div className="w-full h-9 px-3 flex items-center rounded-md cursor-context-menu border bg-neutral-100">
                        {salePrice > 0 ? `${salePrice.toFixed(2)}` : "--"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="discountPercentage"
                        className="text-xs text-gray"
                      >
                        Discount percentage
                      </label>
                      <div className="w-full h-9 relative">
                        <input
                          type="text"
                          id="discountPercentage"
                          value={discountPercentage}
                          placeholder="--"
                          onChange={(e) =>
                            setDiscountPercentage(e.target.value)
                          }
                          className="w-full h-9 px-3 rounded-md placeholder:text-black transition duration-300 ease-in-out border focus:border-neutral-400"
                          required
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
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loading,
                    "active:bg-neutral-700/85": !loading,
                  }
                )}
              >
                {loading ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner />
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
