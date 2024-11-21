import { CloseIconThin } from "@/icons";
import Overlay from "@/ui/Overlay";
import Image from "next/image";
import Link from "next/link";

export function MobileNavbarOverlay() {
  return (
    <Overlay>
      <div className="absolute right-0 bottom-0 top-0 h-full w-96 px-5 pt-3 bg-white">
        <div className="h-full">
          <Link
            href="/"
            className="h-12 min-w-[168px] w-[168px] ml-[2px] flex items-center justify-center"
          >
            <Image
              src="/images/logos/cherlygood_wordmark.svg"
              alt="Cherly Good"
              width={160}
              height={40}
              priority
            />
          </Link>
          <div className="mt-5 flex flex-col gap-1 *:h-10 *:ml-2 *:w-max *:text-lg *:font-medium *:rounded-full *:flex *:items-center">
            <Link href="#">New Arrivals</Link>
            <Link href="#">Dresses</Link>
            <Link href="#">Tops</Link>
            <Link href="#">Bottoms</Link>
            <Link href="#">Outerwear</Link>
            <Link href="#">Shoes</Link>
            <Link href="#">Accessories</Link>
            <Link href="#">Men</Link>
            <Link href="#">Catch-All</Link>
          </div>
        </div>
        <button
          // onClick={hideOverlay}
          className="h-9 w-9 rounded-full absolute right-3 top-2 flex items-center justify-center transition duration-300 ease-in-out hover:bg-lightgray"
          type="button"
        >
          <CloseIconThin size={24} className="stroke-gray" />
        </button>
      </div>
    </Overlay>
  );
}
