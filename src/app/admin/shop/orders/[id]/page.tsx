import config from "@/lib/config";

export default async function OrderDetails({
  params,
}: {
  params: { id: string };
}) {
  const response = await fetch(
    `${config.BASE_URL}/api/paypal/orders/${params.id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch order details", response);
    return <div>Error fetching order details</div>;
  }

  const order = await response.json();
  console.log("Order:", order);

  return (
    <div>
      <h1>Order Details</h1>
      <pre>{JSON.stringify(order, null, 2)}</pre>
    </div>
  );
}
