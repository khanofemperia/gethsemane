"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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

    // Sort orders by timestamp in descending order (latest first)
    const sortedData = [...data].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedArray = sortedData.slice(startIndex, endIndex);
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

  const formatDate = (
    dateString: string,
    timeZone = "Europe/Athens"
  ): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone,
    });
  };

  const formatTime = (
    dateString: string,
    timeZone = "Europe/Athens"
  ): string => {
    if (typeof window === "undefined") {
      return "";
    }

    const date = new Date(dateString);
    return date
      .toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      })
      .replace("24:", "00:");
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
                              {formatTime(timestamp)}
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
                  <ChevronLeft strokeWidth={1.5} className="mr-[2px]" />
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
                  <ChevronRight strokeWidth={1.5} className="ml-[2px]" />
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
