"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 1040;

export default function StickyBar({ Options }: { Options: React.ReactNode }) {
  const [barIsHidden, setBarIsHidden] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= SCROLL_THRESHOLD) {
        setBarIsHidden(false);
      } else {
        setBarIsHidden(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={clsx(
        "hidden md:block w-full py-4 px-5 fixed top-0 border-b -translate-y-full bg-white",
        {
          "-translate-y-full": barIsHidden,
          "translate-y-0 ease-in-out duration-150 transition": !barIsHidden,
        }
      )}
    >
      <div className="w-full max-w-[1080px] h-16 mx-auto flex gap-5 items-center justify-between">
        <div className="h-full flex gap-5">
          <div className="h-full aspect-square relative rounded-md flex items-center justify-center overflow-hidden">
            <Image
              src="https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/fbf522c1b1d84378bd9bda770affaa9a.jpg?imageView2/2/w/800/q/70/format/webp"
              alt="High Waisted Running Shorts"
              width={64}
              height={64}
              priority={true}
            />
            <div className="w-full h-full rounded-md absolute top-0 bottom-0 left-0 right-0 ease-in-out hover:bg-blue hover:bg-opacity-40 hover:duration-300 hover:ease-out"></div>
          </div>
          <div className="h-full flex gap-5 items-center">
            <span className="font-bold">$49.99</span>
            {Options}
          </div>
        </div>
        <div className="w-[348px] min-[840px]:w-[410px] flex gap-3">
          <button className="font-semibold w-full h-[44px] min-[840px]:h-12 text-sm min-[840px]:text-base rounded-full ease-in-out duration-150 transition border border-[rgb(150,150,150)] hover:border-[rgb(80,80,80)] active:border-[rgb(150,150,150)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.16)]">
            Add to Cart
          </button>
          <div className="w-full h-[44px] min-[840px]:h-12 relative rounded-full">
            <button className="peer inline-block text-center align-middle h-[44px] min-[840px]:h-12 w-full text-sm min-[840px]:text-base border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-300 transition bg-custom-amber hover:bg-custom-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]">
              Yes, Let's Upgrade
            </button>
            {!barIsHidden && (
              <div className="peer-hover:block hidden absolute top-[58px] -right-3 py-[18px] px-6 rounded-xl shadow-dropdown bg-white before:content-[''] before:w-[14px] before:h-[14px] before:bg-white before:rounded-tl-[2px] before:rotate-45 before:origin-top-left before:absolute before:-top-[10px] before:border-l before:border-t before:border-[#d9d9d9] before:right-20 min-[840px]:before:right-24">
                <div className="w-max rounded-md pb-[10px] bg-white">
                  <div className="w-full">
                    <div>
                      <h2 className="font-black text-center text-[21px] text-custom-red leading-6 [letter-spacing:-1px] [word-spacing:2px] [text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)] w-[248px] mx-auto">
                        UPGRADE MY ORDER
                      </h2>
                      <div className="mt-1 text-center font-medium text-custom-amber-dimmed">
                        $137.99 (42% Off)
                      </div>
                    </div>
                    <div className="mt-3 h-[210px] aspect-square mx-auto overflow-hidden">
                      <Image
                        src="https://i.pinimg.com/564x/ab/d7/1b/abd71b557fc77916f1570da50c0325a8.jpg"
                        alt="Upgrade my order"
                        width={240}
                        height={240}
                        priority
                      />
                    </div>
                    <div className="w-[200px] mx-auto mt-5 text-xs leading-6 [word-spacing:1px]">
                      <ul className="*:flex *:justify-between">
                        <li>
                          <p className="text-gray">Shorts</p>
                          <p>
                            <span className="font-semibold">$67.99</span>{" "}
                            <span className="line-through text-gray">
                              $79.99
                            </span>
                          </p>
                        </li>
                        <li>
                          <p className="text-gray">Backpack</p>
                          <p>
                            <span className="font-semibold">$41.99</span>{" "}
                            <span className="line-through text-gray">
                              $99.99
                            </span>
                          </p>
                        </li>
                        <li>
                          <p className="text-gray">Sneakers</p>
                          <p>
                            <span className="font-semibold">$29.99</span>{" "}
                            <span className="line-through text-gray">
                              $69.99
                            </span>
                          </p>
                        </li>
                        <li>
                          <p className="text-gray">Hoodie</p>
                          <p>
                            <span className="font-semibold">$79.99</span>{" "}
                            <span className="line-through text-gray">
                              $189.99
                            </span>
                          </p>
                        </li>
                        <li className="mt-2 flex items-center rounded font-semibold">
                          <p className="mx-auto">You Save $100.00</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
