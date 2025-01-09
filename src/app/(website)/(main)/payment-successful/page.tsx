import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function PaymentSuccessful({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const paymentSuccess = cookies().get("payment_success");
  if (!paymentSuccess) {
    redirect("/");
  }

  const email =
    typeof searchParams.email === "string"
      ? decodeURIComponent(searchParams.email)
      : redirect("/");

  // Note: Cookie will be cleared automatically after 5 minutes
  // or when the browser is closed due to the Max-Age setting

  return (
    <div>
      <div className="w-max mx-auto">
        <div className="w-max pt-12 text-center">
          <h1 className="text-2xl font-semibold mb-3">
            Payment successful, thanks so much!
          </h1>
          <p>We're sending confirmation to</p>
          <p className="text-blue font-medium">{email}</p>
        </div>
        <Link
          href="/"
          className="mt-11 mx-auto w-max px-8 flex items-center justify-center rounded-full cursor-pointer border border-[#c5c3c0] text-sm font-semibold h-[44px] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] min-[896px]:text-base min-[896px]:h-12"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
