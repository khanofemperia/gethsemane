import config from "@/lib/config";
import { capitalizeFirstLetter } from "@/lib/utils";

type OrderDetailsType = {
  id: string;
  intent: string;
  status: string;
  payment_source: {
    paypal: {
      email_address: string;
      account_id: string;
      account_status: string;
      name: {
        given_name: string;
        surname: string;
      };
      phone_number: {
        national_number: string;
      };
      address: {
        country_code: string;
      };
      attributes: {
        cobranded_cards: Array<{
          labels: any[];
          payee: {
            email_address: string;
            merchant_id: string;
          };
          amount: {
            currency_code: string;
            value: string;
          };
        }>;
      };
    };
  };
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
      breakdown: {
        item_total: {
          currency_code: string;
          value: string;
        };
        shipping: {
          currency_code: string;
          value: string;
        };
        handling: {
          currency_code: string;
          value: string;
        };
        insurance: {
          currency_code: string;
          value: string;
        };
        shipping_discount: {
          currency_code: string;
          value: string;
        };
        discount: {
          currency_code: string;
          value: string;
        };
      };
    };
    payee: {
      email_address: string;
      merchant_id: string;
    };
    description: string;
    soft_descriptor: string;
    items: Array<{
      name: string;
      unit_amount: {
        currency_code: string;
        value: string;
      };
      tax: {
        currency_code: string;
        value: string;
      };
      quantity: string;
      sku: string;
    }>;
    shipping: {
      name: {
        full_name: string;
      };
      address: {
        address_line_1: string;
        address_line_2: string;
        admin_area_2: string;
        admin_area_1: string;
        postal_code: string;
        country_code: string;
      };
    };
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        final_capture: boolean;
        seller_protection: {
          status: string;
          dispute_categories: string[];
        };
        seller_receivable_breakdown: {
          gross_amount: {
            currency_code: string;
            value: string;
          };
          paypal_fee: {
            currency_code: string;
            value: string;
          };
          net_amount: {
            currency_code: string;
            value: string;
          };
        };
        links: Array<{
          href: string;
          rel: string;
          method: string;
        }>;
        create_time: string;
        update_time: string;
      }>;
    };
  }>;
  payer: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
    payer_id: string;
    phone: {
      phone_number: {
        national_number: string;
      };
    };
    address: {
      country_code: string;
    };
  };
  update_time: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
};

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

  const order: OrderDetailsType = await response.json();

  function formatOrderPlacedDate(order: OrderDetailsType): string {
    const dateObj = new Date(
      order.purchase_units[0].payments.captures[0].create_time
    );

    const formattedDateTime = dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const [datePart, timePart] = formattedDateTime.split(" at ");

    const timezone = dateObj
      .toLocaleTimeString("en-US", { timeZoneName: "short" })
      .split(" ")
      .pop();

    return `${datePart}, at ${timePart.trim()} (${timezone})`;
  }

  const orderPlacedDate = formatOrderPlacedDate(order);

  return (
    <>
      <div className="w-full max-w-[768px] relative flex items-center justify-between shadow rounded-xl bg-white">
        <div className="w-full flex flex-col px-5">
          <div className="flex flex-col gap-3 py-5 border-b">
            <div className="flex gap-5 text-sm">
              <h3 className="min-w-[66px] max-w-[66px] text-gray">Order</h3>
              <div className="flex gap-2 justify-center">
                <span className="w-full font-medium">{order.id}</span>
                <div className="px-2 rounded-full h-5 w-max flex items-center bg-green/10 border border-green/15 text-green">
                  {capitalizeFirstLetter(order.status)}
                </div>
              </div>
            </div>
            <div className="flex gap-5 text-sm">
              <h3 className="min-w-[66px] max-w-[66px] text-gray">Placed on</h3>
              <span className="w-full font-medium">{orderPlacedDate}</span>
            </div>
            <div className="flex gap-5 text-sm">
              <h3 className="min-w-[66px] max-w-[66px] text-gray">Total</h3>
              <span className="w-full font-medium">
                ${order.purchase_units[0].amount.value}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3 py-5 border-b">
            <div className="flex gap-5 text-sm">
              <h3 className="min-w-[66px] max-w-[66px] text-gray">Customer</h3>
              <span className="w-full font-medium">
                {order.payer.name.given_name} {order.payer.name.surname}
              </span>
            </div>
            <div className="flex gap-5 text-sm">
              <h3 className="min-w-[66px] max-w-[66px] text-gray">Email</h3>
              <span className="w-full font-medium">
                {order.payer.email_address}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3 py-5">
            <div className="flex gap-5 text-sm">
              <h3 className="min-w-[66px] max-w-[66px] text-gray">Shipping</h3>
              <span className="w-full font-medium">
                {order.payer.name.given_name} {order.payer.name.surname}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray absolute top-2 right-2"
        ></button>
      </div>
      {/* <div>
        <h1>Order Details</h1>
        <pre>{JSON.stringify(order, null, 2)}</pre>
      </div> */}
    </>
  );
}
