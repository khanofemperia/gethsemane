"use client";

import { useState, useEffect } from "react";
import { TbCopy } from "react-icons/tb";

export default function IDCopyButton({ id }: { id: string }) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isCopied) {
      timeout = setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [isCopied]);

  const handleCopyId = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  return (
    <button
      className="flex gap-2 items-center justify-between px-4 w-max h-9 rounded-full cursor-pointer bg-[#fefaca] shadow-[0px_0.2px_1.6px_#EAB308] ease-in-out transition duration-300 active:bg-[#fef8b6] lg:hover:bg-[#fef8b6]"
      type="button"
      onClick={() => handleCopyId(id)}
    >
      <TbCopy className="text-amber-600" size={18} />
      <span className="text-sm font-semibold text-amber-600">
        {isCopied ? "ID Copied!" : "Copy ID to Clipboard"}
      </span>
    </button>
  );
}
