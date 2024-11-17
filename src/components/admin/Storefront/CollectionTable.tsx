"use client";

import { ChevronLeftIcon, ChevronRightIcon, EditIcon } from "@/icons";
import { capitalizeFirstLetter } from "@/lib/utils/common";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { HiOutlineBan, HiOutlineClock } from "react-icons/hi";
import { IoHourglassOutline } from "react-icons/io5";
import {
  ChangeCollectionIndexButton,
  ChangeCollectionIndexOverlay,
} from "./ChangeCollectionIndexOverlay";
import { NewCollectionEmptyTableButton } from "./NewCollection";

export default function CollectionTable({
  collections,
}: {
  collections: CollectionType[];
}) {
  const CAMPAIGN_STATUS_ENDED = "Ended";
  const CAMPAIGN_STATUS_UPCOMING = "Upcoming";
  const CAMPAIGN_STATUS_ACTIVE = "Active";

  const [currentPage, setCurrentPage] = useState(1);
  const [pageJumpValue, setPageJumpValue] = useState("1");
  const [isPageInRange, setIsPageInRange] = useState(true);

  const pagination = (
    data: CollectionType[] | null,
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
    collections,
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
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getCampaignStatus = (startDate: string, endDate: string): string => {
    const currentDate = new Date();
    const campaignStartDate = new Date(startDate);
    const campaignEndDate = new Date(endDate);

    campaignStartDate.setUTCHours(0, 0, 0, 0);
    campaignEndDate.setUTCHours(0, 0, 0, 0);

    if (currentDate.getTime() > campaignEndDate.getTime()) {
      return CAMPAIGN_STATUS_ENDED;
    } else if (currentDate.getTime() < campaignStartDate.getTime()) {
      return CAMPAIGN_STATUS_UPCOMING;
    } else {
      return CAMPAIGN_STATUS_ACTIVE;
    }
  };

  return (
    <>
      {tableData.length > 0 ? (
        <div>
          <h2 className="font-semibold text-lg mb-5">Collections</h2>
          <div className="w-full h-full py-3 shadow rounded-xl bg-white">
            <div className="h-full">
              <div className="h-full overflow-auto custom-x-scrollbar">
                <table className="w-full text-sm">
                  <thead className="border-y bg-neutral-100">
                    <tr className="h-10 *:font-semibold *:text-gray">
                      <td className="text-center border-r">#</td>
                      <td className="pl-3 border-r">Campaign duration</td>
                      <td className="pl-3 border-r">Title</td>
                      <td className="pl-3 border-r">Products</td>
                      <td className="pl-3 border-r">Type</td>
                      <td className="pl-3 border-r">Visibility</td>
                      <td className="pl-3"></td>
                    </tr>
                  </thead>
                  <tbody className="*:h-[98px] *:border-b">
                    {tableData.map(
                      ({
                        id,
                        index,
                        title,
                        slug,
                        campaignDuration,
                        collectionType,
                        products,
                        visibility,
                      }) => (
                        <tr key={index} className="h-[98px]">
                          <td className="w-14 min-w-14 text-center font-medium border-r">
                            {index}
                          </td>
                          <td className="relative px-3 w-max min-w-max border-r">
                            <div className="flex items-center gap-1 absolute left-3 top-2">
                              {getCampaignStatus(
                                campaignDuration.startDate,
                                campaignDuration.endDate
                              ) === CAMPAIGN_STATUS_UPCOMING && (
                                <IoHourglassOutline
                                  className="stroke-gold fill-gold"
                                  size={18}
                                />
                              )}
                              {getCampaignStatus(
                                campaignDuration.startDate,
                                campaignDuration.endDate
                              ) === CAMPAIGN_STATUS_ACTIVE && (
                                <HiOutlineClock
                                  className="stroke-green"
                                  size={18}
                                />
                              )}
                              {getCampaignStatus(
                                campaignDuration.startDate,
                                campaignDuration.endDate
                              ) === CAMPAIGN_STATUS_ENDED && (
                                <HiOutlineBan
                                  className="stroke-red"
                                  size={18}
                                />
                              )}
                              <span
                                className={clsx("italic", {
                                  "text-gold":
                                    getCampaignStatus(
                                      campaignDuration.startDate,
                                      campaignDuration.endDate
                                    ) === CAMPAIGN_STATUS_UPCOMING,
                                  "text-green":
                                    getCampaignStatus(
                                      campaignDuration.startDate,
                                      campaignDuration.endDate
                                    ) === CAMPAIGN_STATUS_ACTIVE,
                                  "text-red":
                                    getCampaignStatus(
                                      campaignDuration.startDate,
                                      campaignDuration.endDate
                                    ) === CAMPAIGN_STATUS_ENDED,
                                })}
                              >
                                {getCampaignStatus(
                                  campaignDuration.startDate,
                                  campaignDuration.endDate
                                )}
                              </span>
                            </div>
                            <div className="w-full h-[95px] flex items-end pb-2">
                              <div className="flex flex-col gap-1 h-max">
                                <div className="flex gap-2 items-center">
                                  <div
                                    className={clsx(
                                      "px-3 rounded-full h-6 w-max flex gap-1 items-center",
                                      {
                                        "bg-green/10 border border-green/15":
                                          getCampaignStatus(
                                            campaignDuration.startDate,
                                            campaignDuration.endDate
                                          ) === CAMPAIGN_STATUS_ACTIVE,
                                        "bg-lightgray border border-[#6c6c6c]/15":
                                          getCampaignStatus(
                                            campaignDuration.startDate,
                                            campaignDuration.endDate
                                          ) === CAMPAIGN_STATUS_ENDED ||
                                          getCampaignStatus(
                                            campaignDuration.startDate,
                                            campaignDuration.endDate
                                          ) === CAMPAIGN_STATUS_UPCOMING,
                                      }
                                    )}
                                  >
                                    <span className="text-gray">Launch</span>
                                    <ChevronRightIcon
                                      className="stroke-gray"
                                      size={16}
                                    />
                                    <span
                                      className={clsx({
                                        "text-green":
                                          getCampaignStatus(
                                            campaignDuration.startDate,
                                            campaignDuration.endDate
                                          ) === CAMPAIGN_STATUS_ACTIVE,
                                      })}
                                    >
                                      {formatDate(campaignDuration.startDate)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <div
                                    className={clsx(
                                      "px-3 rounded-full h-6 w-max flex gap-1 items-center",
                                      {
                                        "bg-red/10 border border-red/15":
                                          getCampaignStatus(
                                            campaignDuration.startDate,
                                            campaignDuration.endDate
                                          ) === CAMPAIGN_STATUS_ENDED,
                                        "bg-lightgray border border-[#6c6c6c]/15":
                                          getCampaignStatus(
                                            campaignDuration.startDate,
                                            campaignDuration.endDate
                                          ) === CAMPAIGN_STATUS_ACTIVE ||
                                          getCampaignStatus(
                                            campaignDuration.startDate,
                                            campaignDuration.endDate
                                          ) === CAMPAIGN_STATUS_UPCOMING,
                                      }
                                    )}
                                  >
                                    <span className="text-gray">End date</span>
                                    <ChevronRightIcon
                                      className="stroke-gray"
                                      size={16}
                                    />
                                    <span
                                      className={clsx({
                                        "text-red":
                                          getCampaignStatus(
                                            campaignDuration.startDate,
                                            campaignDuration.endDate
                                          ) === CAMPAIGN_STATUS_ENDED,
                                      })}
                                    >
                                      {formatDate(campaignDuration.endDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 w-[250px] min-w-[250px] border-r">
                            <p className="line-clamp-2">{title}</p>
                          </td>
                          <td className="px-3 w-[100px] min-w-[100px] border-r">
                            <p>{products ? products.length : 0}</p>
                          </td>
                          <td className="px-3 w-[100px] min-w-[100px] border-r">
                            <p className="font-medium w-max">
                              {capitalizeFirstLetter(
                                collectionType.toLowerCase()
                              )}
                            </p>
                          </td>
                          <td className="px-3 w-[100px] min-w-[100px] border-r">
                            {visibility === "PUBLISHED" ? (
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
                          <td className="px-3 w-full min-w-full">
                            <div className="flex items-center justify-center">
                              <Link
                                href={`/admin/collections/${slug}-${id}`}
                                className="h-9 w-9 rounded-full flex items-center justify-center ease-in-out duration-300 transition active:bg-lightgray lg:hover:bg-lightgray"
                              >
                                <EditIcon size={20} />
                              </Link>
                              <ChangeCollectionIndexButton
                                data={{ id, title, index: String(index) }}
                              />
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
          {collections.length > rowsPerPage && (
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
            <p className="text-sm mb-4">
              Click the button below to create your first one
            </p>
            <NewCollectionEmptyTableButton />
          </div>
        </div>
      )}
      <ChangeCollectionIndexOverlay />
    </>
  );
}
