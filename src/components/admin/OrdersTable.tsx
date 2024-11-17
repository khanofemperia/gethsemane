"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { capitalizeFirstLetter } from "@/lib/utils/common";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

export default function OrdersTable({
  orders,
}: {
  orders: OrderType[] | null;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageJumpValue, setPageJumpValue] = useState("1");
  const [isPageInRange, setIsPageInRange] = useState(true);

  const pagination = (
    data: OrderType[] | null,
    currentPage: number,
    rowsPerPage: number
  ) => {
    if (!data || data.length === 0) {
      return {
        paginatedArray: [],
        totalPages: 0,
      };
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedArray = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    return {
      paginatedArray,
      totalPages,
    };
  };

  const rowsPerPage = 5;
  const { paginatedArray: tableData, totalPages } = pagination(
    orders || [],
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

  const jumpToPage = () => {
    const page = parseInt(pageJumpValue, 10);

    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setIsPageInRange(true);
    } else {
      setIsPageInRange(false);
    }
  };

  const pageJumpEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      jumpToPage();
    }
  };

  const pageJumpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPageJumpValue(value);
    }
  };

  const jumpToLastPage = () => {
    setPageJumpValue(String(totalPages));
    setCurrentPage(totalPages);
    setIsPageInRange(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <>
      {tableData.length > 0 ? (
        <div>
          <h2 className="font-semibold text-lg mb-5">Orders</h2>
          <div className="w-full h-full py-3 shadow rounded-xl bg-white">
            <div className="h-full">
              <div className="h-full overflow-auto custom-x-scrollbar">
                <table className="w-full text-sm">
                  <thead className="border-y bg-neutral-100">
                    <tr className="h-10 *:font-semibold *:text-gray">
                      <td className="pl-5">Customer</td>
                      <td className="pl-3">Date</td>
                      <td className="pl-3">Time</td>
                      <td className="pl-3">Status</td>
                      <td className="pl-3">Total</td>
                      <td className="pl-3">Country</td>
                    </tr>
                  </thead>
                  <tbody className="*:h-10 *:border-b">
                    {tableData.map(
                      ({ id, timestamp, payer, amount, shipping, status }) => (
                        <tr key={id} className="h-[98px]">
                          <td className="pl-5 pr-3 w-[160px] min-w-[160px]">
                            <Link
                              href={`/admin/orders/${id}`}
                              className="w-max line-clamp-1 font-medium text-blue hover:underline"
                            >
                              {payer.name.firstName} {payer.name.lastName}
                            </Link>
                          </td>
                          <td className="px-3 w-[140px] min-w-[140px]">
                            <p className="font-medium">
                              {formatDate(timestamp)}
                            </p>
                          </td>
                          <td className="px-3 w-[120px] min-w-[120px]">
                            <p className="font-medium">
                              {/* {formatTime(timestamp)} */}
                              14:10
                            </p>
                          </td>
                          <td className="px-3 w-[140px] min-w-[140px]">
                            <div className="px-3 rounded-full h-5 w-max flex items-center bg-green/10 border border-green/15 text-green">
                              {capitalizeFirstLetter(status)}
                            </div>
                          </td>
                          <td className="px-3 w-[140px] min-w-[140px]">
                            <p className="font-medium">${amount.value}</p>
                          </td>
                          <td className="px-3 w-[140px] min-w-[140px]">
                            <p className="font-medium">
                              {shipping.address.country}
                            </p>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {orders && orders.length > rowsPerPage && (
            <div className="mt-10">
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
                  className={clsx(
                    "min-w-[36px] max-w-[36px] h-9 px-1 text-center border cursor-text outline-none rounded-full bg-white",
                    {
                      "border-red": !isPageInRange,
                    }
                  )}
                  type="text"
                />
                <div className="flex items-center justify-center px-1 cursor-context-menu">
                  of
                </div>
                <button
                  onClick={jumpToLastPage}
                  className="w-9 h-9 flex items-center justify-center border rounded-full ease-in-out duration-300 transition bg-white active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
                >
                  {totalPages}
                </button>
                <button
                  onClick={handleNext}
                  className="w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed "
                >
                  <ChevronRightIcon className="-mr-[2px]" size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-t pt-5 flex justify-center">
          <div className="text-center">
            <h2 className="font-semibold text-lg mb-2">No collections yet</h2>
          </div>
        </div>
      )}
    </>
  );
}
