import config from "@/lib/config";

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

  return (
    <>
      <div className="w-full relative flex items-center justify-between shadow rounded-xl bg-white">
        <div className="w-[calc(100%-60px)]">
          <div className="p-5">
            <h3 className="text-xs text-gray mb-2">Buyer</h3>
            <p className="font-medium">
              {order.payer.name.given_name} {order.payer.name.surname}
            </p>
          </div>
          <div className="p-5">
            <h3 className="text-xs text-gray mb-2">Email</h3>
            <p className="font-medium">{order.payer.email_address}</p>
          </div>
          <div className="p-5">
            <h3 className="text-xs text-gray mb-2">Shipping address</h3>
            <div className="flex flex-col gap-2 font-medium">
              <span>
                {order.purchase_units[0].shipping.address.address_line_1},{" "}
                {order.purchase_units[0].shipping.address.address_line_2}
              </span>
              <span>
                {order.purchase_units[0].shipping.address.admin_area_2},{" "}
                {order.purchase_units[0].shipping.address.admin_area_1}{" "}
                {order.purchase_units[0].shipping.address.postal_code}
              </span>
              <span>
                {order.purchase_units[0].shipping.address.country_code}
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
