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
      className="flex gap-2 items-center justify-between px-4 w-max h-9 rounded-full cursor-pointer shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#f9f9f9_5%,_#e9e9e9_100%)] bg-[#f9f9f9] border border-[#dcdcdc] text-[#666666] [text-shadow:0px_1px_0px_#ffffff] hover:[background:linear-gradient(to_bottom,_#e9e9e9_5%,_#f9f9f9_100%)] hover:bg-[#e9e9e9]"
      type="button"
      onClick={() => handleCopyId(id)}
    >
      <TbCopy className="text-gray" size={18} />
      <span className="text-sm font-semibold text-gray">
        {isCopied ? "ID Copied!" : "Copy ID to Clipboard"}
      </span>
    </button>
  );
}