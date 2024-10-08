export default async function PaymentSuccessful() {
  return (
    <div>
      <div className="w-max mx-auto">
        <div className="w-max pt-10 text-center">
          <h1 className="text-2xl font-semibold mb-3 text-green">
            Payment successful, thanks so much!
          </h1>
          <p>We're sending confirmation to</p>
          <p className="font-semibold">mycustomer@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
