import Link from "next/link";

export default function ViewCartButton() {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/cart"
        className="rounded-full relative flex items-center justify-center px-3 h-12 min-h-12 w-[320px] font-semibold text-white bg-green"
      >
        Added (1) - View Cart
      </Link>
      <Link
        href="/cart"
        className="rounded-full flex items-center justify-center px-3 h-12 min-h-12 w-[320px] font-semibold border"
      >
        Keep shopping
      </Link>
    </div>
  );
}
