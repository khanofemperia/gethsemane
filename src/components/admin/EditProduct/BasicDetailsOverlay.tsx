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

type DataType = {
  id: string;
  category: string;
  name: string;
  slug: string;
  price: string;
};

export function BasicDetailsButton() {
  const { showOverlay } = useOverlayStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.editProduct.name,
    overlayName: state.pages.editProduct.overlays.basicDetails.name,
  }));

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className="w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
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
  const [formData, setFormData] = useState({
    id: data.id,
    category: data.category,
    name: data.name,
    slug: data.slug,
    price: data.price,
  });

  const categoryRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const { hideOverlay } = useOverlayStore();

  const { pageName, isOverlayVisible, overlayName } = useOverlayStore(
    (state) => ({
      pageName: state.pages.editProduct.name,
      overlayName: state.pages.editProduct.overlays.basicDetails.name,
      isOverlayVisible: state.pages.editProduct.overlays.basicDetails.isVisible,
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

    setFormData((prevData) => ({
      ...prevData,
      category: capitalizeFirstLetter(category),
    }));
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

    try {
      const result = await UpdateProductAction(formData);
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    let sanitizedValue = value;

    if (name === "slug") {
      sanitizedValue = value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: sanitizedValue,
    }));
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <form onSubmit={handleSave}>
              <div className="w-full h-[calc(100vh-188px)] md:h-auto">
                <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                  <div className="relative flex justify-center items-center w-full h-7">
                    <h2 className="font-semibold text-lg">Basic details</h2>
                    <button
                      onClick={() => {
                        hideOverlay({ pageName, overlayName });
                        setSelectedCategory(data.category);
                        setFormData({
                          id: data.id,
                          category: data.category,
                          name: data.name,
                          slug: data.slug,
                          price: data.price,
                        });
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
                      setSelectedCategory(data.category);
                      setFormData({
                        id: data.id,
                        category: data.category,
                        name: data.name,
                        slug: data.slug,
                        price: data.price,
                      });
                    }}
                    type="button"
                    className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray"
                  >
                    <ArrowLeftIcon
                      className="fill-blue -ml-[2px]"
                      size={20}
                    />
                    <span className="font-semibold text-sm text-blue">
                      Basic details
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={clsx(
                      "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue",
                      {
                        "bg-opacity-50": loading,
                        "active:bg-blue-dimmed": !loading,
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
                    <h2 className="font-semibold text-sm">Category</h2>
                    <div ref={categoryRef} className="w-full h-9 relative">
                      <button
                        onClick={() =>
                          setIsCategoryDropdownOpen((prevState) => !prevState)
                        }
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
                              onClick={() =>
                                handleCategorySelect(category.name)
                              }
                            >
                              {category.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="font-semibold text-sm">
                      Name
                    </label>
                    <div className="w-full h-9 relative">
                      <input
                        type="text"
                        name="name"
                        placeholder="Denim Mini Skirt"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-blue"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="slug" className="font-semibold text-sm">
                      Slug
                    </label>
                    <div className="w-full h-9 relative">
                      <input
                        type="text"
                        name="slug"
                        placeholder="denim-mini-skirt"
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-blue"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="price" className="font-semibold text-sm">
                      Price
                    </label>
                    <div className="w-full h-9 relative">
                      <input
                        type="text"
                        name="price"
                        placeholder="34.99"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-blue"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0">
                <button
                  type="submit"
                  disabled={loading}
                  className={clsx(
                    "relative h-12 w-full rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue",
                    {
                      "bg-opacity-50": loading,
                      "active:bg-blue-dimmed": !loading,
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
            </form>
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
