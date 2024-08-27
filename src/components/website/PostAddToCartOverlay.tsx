import { CheckmarkIcon, CloseIconThin } from "@/icons";
import { formatThousands } from "@/lib/utils";
import Overlay from "@/ui/Overlay";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";

export function PostAddToCartOverlay() {
  return (
    <Overlay>
      <div className="w-full h-full pt-20 flex justify-center">
        <div className="w-[436px] h-max p-8 pt-6 rounded-2xl relative overflow-hidden shadow-lg bg-white">
          <div>
            <div className="mb-5 flex gap-1 items-center justify-center">
              <CheckmarkIcon size={24} className="fill-green" />
              <h2 className="font-semibold text-green">Added to cart</h2>
            </div>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2 items-center w-80 mx-auto">
                <div className="min-w-32 max-w-32 h-32 flex items-center justify-center overflow-hidden">
                  <Image
                    src="https://img.kwcdn.com/product/fancy/cfa0c336-0166-43a2-acb9-00205851a7d4.jpg?imageView2/2/w/800/q/70/format/webp"
                    alt="Lace Splicing Crew Neck T-shirt, Casual Short Sleeve Top For Spring & Summer, Women's Clothing"
                    width={144}
                    height={144}
                    priority
                  />
                </div>
                <div className="text-sm font-medium h-8 w-max px-4 rounded-full flex items-center justify-center gap-[2px] bg-lightgray">
                  <span className="text-gray">Color: </span>
                  <span>Sky Blue</span>
                  <span>, </span>
                  <span className="text-gray">Size: </span>
                  <span>M</span>
                </div>
              </div>
              <div className="w-full mx-auto flex gap-3">
                <button className="font-semibold w-full h-12 flex items-center justify-center rounded-full ease-in-out duration-150 transition border border-[rgb(150,150,150)] hover:border-[rgb(80,80,80)] active:border-[rgb(150,150,150)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.16)]">
                  Keep shopping
                </button>
                <button className="inline-block text-center align-middle h-12 w-full border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-100 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]">
                  Go to cart
                </button>
              </div>
            </div>
          </div>
          <button
            className="h-9 w-9 rounded-full absolute right-3 top-2 flex items-center justify-center transition duration-300 ease-in-out hover:bg-lightgray"
            type="button"
          >
            <CloseIconThin size={24} className="stroke-gray" />
          </button>
        </div>
      </div>
    </Overlay>
  );
}
