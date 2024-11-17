"use client";

import AlertMessage from "@/components/shared/AlertMessage";
import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  EditIcon,
  PlusIcon,
} from "@/icons";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { AddProductAction } from "@/actions/collections";
import Image from "next/image";
import { capitalizeFirstLetter, formatThousands } from "@/lib/utils/common";
import Link from "next/link";
import {
  RemoveProductButton,
  RemoveProductOverlay,
} from "./RemoveProductOverlay";
import {
  ChangeProductIndexButton,
  ChangeProductIndexOverlay,
} from "./ChangeProductIndexOverlay";
import { AlertMessageType } from "@/lib/sharedTypes";

type ProductWithIndex = ProductType & { index: number };

export function ProductListButton({ className }: { className: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editCollection.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editCollection.overlays.productList.name
  );

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

export function ProductListOverlay({
  data,
}: {
  data: { id: string; products: ProductWithIndex[] };
}) {
  const PUBLISHED = "PUBLISHED";
  const DRAFT = "DRAFT";
  const HIDDEN = "HIDDEN";
  const INACTIVE = "INACTIVE";
  const ALL = "ALL";

  const [loading, setLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );
  const [productId, setProductId] = useState("");
  const [filter, setFilter] = useState<string>(ALL);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageJumpValue, setPageJumpValue] = useState("1");
  const [isPageInRange, setIsPageInRange] = useState(true);

  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editCollection.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editCollection.overlays.productList.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editCollection.overlays.productList.isVisible
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

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
    setFilter(ALL);
    setPageJumpValue("1");
    setCurrentPage(1);
    setIsPageInRange(true);
    setProductId("");
  };

  const hideAlertMessage = () => {
    setShowAlert(false);
    setAlertMessage("");
    setAlertMessageType(AlertMessageType.NEUTRAL);
  };

  const addProduct = async () => {
    if (!productId.trim()) {
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Product ID cannot be empty");
      setShowAlert(true);
      return;
    } else if (!/^\d{5}$/.test(productId.trim())) {
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Product ID must be a 5-digit number");
      setShowAlert(true);
      return;
    }

    setLoading(true);

    try {
      const result = await AddProductAction({
        collectionId: data.id,
        productId,
      });
      setAlertMessageType(result.type);
      setAlertMessage(result.message);
      setShowAlert(true);
      setProductId("");
    } catch (error) {
      console.error("Error adding product:", error);
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Failed to add product");
      setShowAlert(true);
    } finally {
      setLoading(false);
      setPageJumpValue("1");
      setCurrentPage(1);
      setIsPageInRange(true);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setProductId(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      addProduct();
    }
  };

  const getFilteredProducts = (filter: string) => {
    if (filter === PUBLISHED) {
      return data.products.filter(
        (product) => product.visibility.toUpperCase() === PUBLISHED
      );
    } else if (filter === INACTIVE) {
      return data.products.filter(
        (product) =>
          product.visibility.toUpperCase() === HIDDEN ||
          product.visibility.toUpperCase() === DRAFT
      );
    }
    return data.products;
  };

  const filteredProducts = getFilteredProducts(filter);

  const handleFilterChange = (newFilter: string) => {
    const newFilteredProducts = getFilteredProducts(newFilter);

    if (newFilteredProducts.length === 0) {
      setAlertMessageType(AlertMessageType.NEUTRAL);
      setAlertMessage(
        `${capitalizeFirstLetter(
          newFilter.toLowerCase()
        )} filter has no products`
      );
      setShowAlert(true);
    } else {
      setFilter(newFilter);
      setPageJumpValue("1");
      setCurrentPage(1);
      setIsPageInRange(true);
    }
  };

  const pagination = (
    data: ProductWithIndex[],
    currentPage: number,
    rowsPerPage: number
  ) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedArray = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    return {
      paginatedArray,
      totalPages,
    };
  };

  const rowsPerPage = 2;
  const { paginatedArray: tableData, totalPages } = pagination(
    filteredProducts,
    currentPage,
    rowsPerPage
  );

  const handlePrevious = () => {
    setCurrentPage((prevPage) => {
      const value = Math.max(prevPage - 1, 1);
      setPageJumpValue(String(value));

      return value;
    });
    setIsPageInRange(true);
  };

  const handleNext = () => {
    setCurrentPage((prevPage) => {
      const value = Math.min(prevPage + 1, totalPages);
      setPageJumpValue(String(value));

      return value;
    });
    setIsPageInRange(true);
  };

  const jumpToLastPage = () => {
    setPageJumpValue(String(totalPages));
    setCurrentPage(totalPages);
    setIsPageInRange(true);
  };

  const jumpToPage = () => {
    const page = parseInt(pageJumpValue, 10);

    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setIsPageInRange(true);
    } else {
      setIsPageInRange(false);
    }
  };

  const pageJumpEnterKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      jumpToPage();
    }
  };

  const pageJumpInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setPageJumpValue(value);
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="md:mx-auto md:mt-20 md:mb-[50vh] md:px-5 lg:p-0">
            <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] mx-auto ease-in-out duration-300 transition overflow-hidden md:overflow-visible rounded-t-3xl bg-white md:w-full md:max-w-[773.8px] md:rounded-2xl md:shadow md:h-max md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
              <div className="w-full">
                <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                  <div className="relative flex justify-center items-center w-full h-7">
                    <h2 className="font-semibold text-lg">Products</h2>
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
                    className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                  >
                    <ArrowLeftIcon className="fill-blue -ml-[2px]" size={20} />
                    <span className="font-semibold text-sm text-blue">
                      Products
                    </span>
                  </button>
                </div>
                {tableData.length > 0 ? (
                  <div className="w-full h-full mt-[52px] md:mt-0 px-5 pt-5 pb-28 md:pb-10 flex flex-col gap-2 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                    <div className="w-full flex flex-col min-[588px]:flex-row gap-2 items-center justify-between">
                      <div className="max-w-full flex flex-nowrap rounded-full bg-lightgray overflow-x-visible overflow-y-hidden invisible-scrollbar *:min-w-max *:h-9 *:rounded-full *:flex *:items-center *:justify-center *:font-semibold *:text-sm *:ease-in-out *:duration-300 *:transition">
                        <button
                          onClick={() => handleFilterChange(ALL)}
                          className={`px-3 pl-[14px] h-9 hover:bg-lightgray-dimmed rounded-full ${
                            filter === ALL
                              ? "text-blue"
                              : "text-gray hover:text-black"
                          }`}
                        >
                          View all ({data.products.length})
                        </button>
                        <button
                          onClick={() => handleFilterChange(PUBLISHED)}
                          className={`px-3 h-9 hover:bg-lightgray-dimmed rounded-full ${
                            filter === PUBLISHED
                              ? "text-blue"
                              : "text-gray hover:text-black"
                          }`}
                        >
                          Published (
                          {
                            data.products.filter(
                              (product) =>
                                product.visibility.toUpperCase() === PUBLISHED
                            ).length
                          }
                          )
                        </button>
                        <button
                          onClick={() => handleFilterChange(INACTIVE)}
                          className={`px-3 pr-[14px] h-9 hover:bg-lightgray-dimmed rounded-full ${
                            filter === INACTIVE
                              ? "text-blue"
                              : "text-gray hover:text-black"
                          }`}
                        >
                          Inactive (
                          {
                            data.products.filter(
                              (product) =>
                                product.visibility.toUpperCase() === HIDDEN ||
                                product.visibility.toUpperCase() === DRAFT
                            ).length
                          }
                          )
                        </button>
                      </div>
                      <div className="w-full min-[588px]:w-56 h-9 rounded-full overflow-hidden flex items-center border shadow-sm">
                        <input
                          type="text"
                          value={productId}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Paste ID (#12345)"
                          className="h-full w-full pl-4 bg-transparent"
                        />
                        <div className="h-full flex items-center justify-center">
                          <button
                            onClick={addProduct}
                            disabled={loading}
                            className={clsx(
                              "w-11 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out",
                              {
                                "active:bg-lightgray lg:hover:bg-lightgray":
                                  !loading,
                              }
                            )}
                          >
                            {loading ? (
                              <Spinner color="gray" />
                            ) : (
                              <PlusIcon size={22} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {tableData.length > 0 && (
                      <div className="w-full h-full py-3 border rounded-xl bg-white">
                        <div className="h-full">
                          <div className="h-full overflow-auto custom-x-scrollbar">
                            <table className="w-full text-sm">
                              <thead className="border-y bg-neutral-100">
                                <tr className="h-10 *:font-semibold *:text-gray">
                                  <td className="text-center border-r">#</td>
                                  <td className="pl-3 border-r">Main image</td>
                                  <td className="pl-3 border-r">Name</td>
                                  <td className="pl-3 border-r">Price</td>
                                  <td className="pl-3 border-r">Visibility</td>
                                  <td className="pl-3"></td>
                                </tr>
                              </thead>
                              <tbody className="*:h-[98px] *:border-b">
                                {tableData.map(
                                  ({
                                    id,
                                    index,
                                    slug,
                                    images,
                                    name,
                                    pricing,
                                    visibility,
                                  }) => (
                                    <tr
                                      key={id}
                                      className="h-[98px] max-h-[98px]"
                                    >
                                      <td className="max-w-14 min-w-14 text-center font-medium border-r">
                                        {index}
                                      </td>
                                      <td className="p-3 max-w-[120px] min-w-[120px] border-r">
                                        <div className="aspect-square w-full overflow-hidden flex items-center justify-center bg-white">
                                          <Image
                                            src={images.main}
                                            alt={name}
                                            width={216}
                                            height={216}
                                            priority
                                          />
                                        </div>
                                      </td>
                                      <td className="px-3 max-w-[180px] min-w-[180px] border-r">
                                        <p className="line-clamp-2">{name}</p>
                                      </td>
                                      <td className="px-3 max-w-[180px] min-w-[180px] border-r">
                                        <div className="w-max flex items-center justify-center">
                                          {Number(pricing.salePrice) ? (
                                            <div className="flex items-center gap-[6px]">
                                              <div className="flex items-baseline">
                                                <span className="text-[0.813rem] leading-3 font-semibold">
                                                  $
                                                </span>
                                                <span className="text-lg font-bold">
                                                  {Math.floor(
                                                    Number(pricing.salePrice)
                                                  )}
                                                </span>
                                                <span className="text-[0.813rem] leading-3 font-semibold">
                                                  {(
                                                    Number(pricing.salePrice) %
                                                    1
                                                  )
                                                    .toFixed(2)
                                                    .substring(1)}
                                                </span>
                                              </div>
                                              <span className="text-[0.813rem] leading-3 text-gray line-through">
                                                $
                                                {formatThousands(
                                                  Number(pricing.basePrice)
                                                )}
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="flex items-baseline">
                                              <span className="text-[0.813rem] leading-3 font-semibold">
                                                $
                                              </span>
                                              <span className="text-lg font-bold">
                                                {Math.floor(
                                                  Number(pricing.basePrice)
                                                )}
                                              </span>
                                              <span className="text-[0.813rem] leading-3 font-semibold">
                                                {(Number(pricing.basePrice) % 1)
                                                  .toFixed(2)
                                                  .substring(1)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-3 max-w-[150px] min-w-[150px] border-r">
                                        {visibility.toUpperCase() ===
                                        PUBLISHED ? (
                                          <p className="px-3 rounded-full h-6 w-max flex gap-1 items-center bg-green/10 border border-green/15 text-green">
                                            {capitalizeFirstLetter(
                                              visibility.toLowerCase()
                                            )}
                                          </p>
                                        ) : (
                                          <p className="px-3 rounded-full h-6 w-max flex gap-1 items-center bg-lightgray border border-[#6c6c6c]/15 text-gray">
                                            {capitalizeFirstLetter(
                                              visibility.toLowerCase()
                                            )}
                                          </p>
                                        )}
                                      </td>
                                      <td className="px-3 max-w-[150px] min-w-[150px]">
                                        <div className="flex items-center justify-center">
                                          <Link
                                            href={`/admin/products/${slug}-${id}`}
                                            className="h-9 w-9 rounded-full flex items-center justify-center ease-in-out duration-300 transition active:bg-lightgray lg:hover:bg-lightgray"
                                          >
                                            <EditIcon size={20} />
                                          </Link>
                                          <ChangeProductIndexButton
                                            collectionId={data.id}
                                            product={{
                                              id,
                                              name,
                                              index,
                                            }}
                                          />
                                          <RemoveProductButton id={id} />
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                    {filteredProducts.length > rowsPerPage && (
                      <div className="mt-2">
                        <div className="w-max mx-auto flex gap-1 h-9">
                          <button
                            onClick={handlePrevious}
                            className="w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
                          >
                            <ChevronLeftIcon className="-ml-[2px]" size={24} />
                          </button>
                          <input
                            value={pageJumpValue}
                            onChange={pageJumpInputChange}
                            onKeyDown={pageJumpEnterKey}
                            type="text"
                            className={clsx(
                              "min-w-[36px] max-w-[36px] h-9 px-1 text-center border cursor-text outline-none rounded-full bg-white",
                              {
                                "border-red": !isPageInRange,
                              }
                            )}
                          />
                          <div className="flex items-center justify-center px-1 cursor-context-menu">
                            of
                          </div>
                          <button
                            onClick={jumpToLastPage}
                            className="w-9 h-9 flex items-center justify-center border rounded-full ease-in-out duration-300 transition active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
                          >
                            {totalPages}
                          </button>
                          <button
                            onClick={handleNext}
                            className="w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition bg-white active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed "
                          >
                            <ChevronRightIcon className="-mr-[2px]" size={24} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-4 items-center mt-[52px] md:mt-0 px-5 pt-5 pb-28 md:pb-[90px]">
                    <div className="flex flex-col gap-2 items-center">
                      <h2 className="font-semibold text-lg">
                        Collection is empty
                      </h2>
                      <p className="text-sm text-center">
                        Enter ID below for your first product
                      </p>
                    </div>
                    <div className="w-full min-[588px]:w-56 h-9 rounded-full overflow-hidden flex items-center border shadow-sm">
                      <input
                        type="text"
                        value={productId}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste ID (#12345)"
                        className="h-full w-full pl-4 bg-transparent"
                      />
                      <div className="h-full flex items-center justify-center">
                        <button
                          onClick={addProduct}
                          disabled={loading}
                          className={clsx(
                            "w-11 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out",
                            {
                              "active:bg-lightgray lg:hover:bg-lightgray":
                                !loading,
                            }
                          )}
                        >
                          {loading ? (
                            <Spinner color="gray" />
                          ) : (
                            <PlusIcon size={22} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
      <RemoveProductOverlay collectionId={data.id} />
      <ChangeProductIndexOverlay />
    </>
  );
}
