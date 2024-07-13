import clsx from "clsx";
import { capitalizeFirstLetter } from "@/libraries/utils";

type DataChipType = {
  value: ChipValueType;
};

const chipStyles: Record<ChipValueType, string> = {
  published:
    "bg-custom-green/10 border border-custom-green/15 text-custom-green",
  draft: "bg-lightgray border border-[#6c6c6c]/15 text-gray",
  hidden: "bg-lightgray border border-[#6c6c6c]/15 text-gray",
};

export default function DataChip({ value }: DataChipType) {
  const chipColor = clsx(
    "px-3 rounded-full h-6 w-max flex items-center",
    chipStyles[value.toLowerCase() as ChipValueType],
  );

  return <div className={chipColor}>{capitalizeFirstLetter(value.toLowerCase())}</div>;
}
