"use client";

export function OrderEmails() {
  async function handleSendOrderEmail() {
    const response = await fetch("/api/order-emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "recipient@example.com",
        subject: "Order Notification",
        text: "Your order has been placed.",
        html: "<h1>Order Notification</h1><p>Your order has been placed.</p>",
      }),
    });

    const data = await response.json();
    console.log(data);
  }

  return (
    <div className="flex flex-wrap gap-5">
      <div className="w-[300px] py-3 px-4 border cursor-pointer rounded-lg flex flex-col gap-2 hover:border-gray-600">
        <div onClick={handleSendOrderEmail}>
          <h2 className="font-semibold text-sm mb-2">Order Confirmation</h2>
          <div>
            <span className="text-xs text-green">1 of 2 attempts used</span>{" "}
            <span className="text-xs text-gray">• Last sent Nov 3, 2024</span>
          </div>
        </div>
      </div>
      <div className="w-[300px] py-3 px-4 border cursor-pointer rounded-lg flex flex-col gap-2 hover:border-gray-600">
        <div>
          <h2 className="font-semibold text-sm mb-2">Shipping Confirmation</h2>
          <div>
            <span className="text-xs text-gray">Not sent yet</span>{" "}
            <span className="text-xs text-gray">• 2 attempts remaining</span>
          </div>
        </div>
      </div>
      <div className="w-[300px] py-3 px-4 border cursor-pointer rounded-lg flex flex-col gap-2 hover:border-gray-600">
        <div>
          <h2 className="font-semibold text-sm mb-2">Delivery Confirmation</h2>
          <p className="text-xs text-gray"></p>
          <div>
            <span className="text-xs text-red">Max attempts used</span>{" "}
            <span className="text-xs text-gray">• Last sent Nov 5, 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}
