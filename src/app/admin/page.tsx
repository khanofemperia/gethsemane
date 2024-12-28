export default function Overview() {
  return (
    <div className="max-w-[812px] flex flex-col gap-10 px-5">
      <div>
        <h2 className="font-semibold text-xl mb-6">Store Growth</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <StoreGrowth />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Best-Selling Products</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <BestsellingProducts />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Revenue by Category</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <RevenueByCategory />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Product Status</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <ProductStatus />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Cart Status Breakdown</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <CartStatusBreakdown />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Upsell Performance</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <UpsellPerformance />
        </div>
      </div>
    </div>
  );
}

const StoreGrowth = () => (
  <div className="rounded-md border overflow-hidden">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="bg-neutral-100">
          <th className="py-2 px-4 font-medium text-gray">Metric</th>
          <th className="py-2 px-4 font-medium text-gray">Today</th>
          <th className="py-2 px-4 font-medium text-gray">This Month</th>
          <th className="py-2 px-4 font-medium text-gray">All-Time</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">Revenue ($)</td>
          <td className="py-2 px-4 font-semibold text-green-700">
            $12,450 <span className="text-xs">(+15%)</span>
          </td>
          <td className="py-2 px-4 font-semibold text-green-700">
            $205,340 <span className="text-xs">(↑10%)</span>
          </td>
          <td className="py-2 px-4 font-semibold">$4,125,620</td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">Orders</td>
          <td className="py-2 px-4">191</td>
          <td className="py-2 px-4">3,150</td>
          <td className="py-2 px-4">63,120</td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">AOV ($)</td>
          <td className="py-2 px-4">$65.20</td>
          <td className="py-2 px-4">$65.21</td>
          <td className="py-2 px-4">$65.30</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const BestsellingProducts = () => (
  <div className="rounded-md border overflow-hidden">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="bg-neutral-100">
          <th className="py-2 px-4 font-medium text-gray">Product</th>
          <th className="py-2 px-4 font-medium text-gray">
            Revenue (This Month)
          </th>
          <th className="py-2 px-4 font-medium text-gray">
            Units Sold (This Month)
          </th>
          <th className="py-2 px-4 font-medium text-gray">Revenue (Today)</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">Summer Floral Dress</td>
          <td className="py-2 px-4 font-semibold text-green-700">$25,350</td>
          <td className="py-2 px-4">845</td>
          <td className="py-2 px-4">$2,500</td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">High-Waist Jeans</td>
          <td className="py-2 px-4 font-semibold text-green-700">$22,680</td>
          <td className="py-2 px-4">756</td>
          <td className="py-2 px-4">$2,200</td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">Casual Blouse</td>
          <td className="py-2 px-4 font-semibold text-green-700">$13,960</td>
          <td className="py-2 px-4">698</td>
          <td className="py-2 px-4">$1,500</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const RevenueByCategory = () => (
  <div className="rounded-md border overflow-hidden">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="bg-neutral-100">
          <th className="py-2 px-4 font-medium text-gray">Category</th>
          <th className="py-2 px-4 font-medium text-gray">
            Revenue (This Month)
          </th>
          <th className="py-2 px-4 font-medium text-gray">All-Time Revenue</th>
          <th className="py-2 px-4 font-medium text-gray">Contribution</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">Dresses</td>
          <td className="py-2 px-4 font-semibold text-green-700">$62,350</td>
          <td className="py-2 px-4">$1,245,210</td>
          <td className="py-2 px-4 font-semibold text-green-700">30.2%</td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">Tops</td>
          <td className="py-2 px-4 font-semibold text-green-700">$51,430</td>
          <td className="py-2 px-4">$980,510</td>
          <td className="py-2 px-4 font-semibold text-green-700">23.8%</td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">Bottoms</td>
          <td className="py-2 px-4 font-semibold text-green-700">$40,125</td>
          <td className="py-2 px-4">$730,230</td>
          <td className="py-2 px-4 font-semibold text-green-700">17.7%</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const ProductStatus = () => (
  <div className="rounded-md border overflow-hidden">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="bg-neutral-100">
          <th className="py-2 px-4 font-medium text-gray">Status</th>
          <th className="py-2 px-4 font-medium text-gray">Product Count</th>
          <th className="py-2 px-4 font-medium text-gray">Summary</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium text-green-700">
            <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
              Active
            </span>
          </td>
          <td className="py-2 px-4 font-semibold">45</td>
          <td className="py-2 px-4">Currently available for sale.</td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium text-yellow-700">
            <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
              Hidden
            </span>
          </td>
          <td className="py-2 px-4 font-semibold">10</td>
          <td className="py-2 px-4">Awaiting restock or clearance.</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const CartStatusBreakdown = () => (
  <div className="rounded-md border overflow-hidden">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="bg-neutral-100">
          <th className="py-2 px-4 font-medium text-gray">Status</th>
          <th className="py-2 px-4 font-medium text-gray">Cart Count</th>
          <th className="py-2 px-4 font-medium text-gray">Total Value</th>
          <th className="py-2 px-4 font-medium text-gray">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium text-green-700">
            <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
              Active
            </span>
          </td>
          <td className="py-2 px-4 font-semibold">234</td>
          <td className="py-2 px-4 font-semibold">$15,680</td>
          <td className="py-2 px-4">Carts within &lt; 24 hours.</td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium text-yellow-700">
            <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
              Idle
            </span>
          </td>
          <td className="py-2 px-4 font-semibold">567</td>
          <td className="py-2 px-4 font-semibold">$42,560</td>
          <td className="py-2 px-4">Carts inactive for 1-7 days.</td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium text-gray-700">
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
              Abandoned
            </span>
          </td>
          <td className="py-2 px-4 font-semibold">890</td>
          <td className="py-2 px-4 font-semibold">$67,450</td>
          <td className="py-2 px-4">Carts abandoned for 7-30 days.</td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">
            <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
              Dead
            </span>
          </td>
          <td className="py-2 px-4 font-semibold">1,234</td>
          <td className="py-2 px-4 font-semibold">$98,760</td>
          <td className="py-2 px-4">Carts older than 30 days.</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const UpsellPerformance = () => (
  <div className="rounded-md border overflow-hidden">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="bg-neutral-100">
          <th className="w-56 py-2 px-4 text-sm font-medium text-gray">Metric</th>
          <th className="py-2 px-4 text-sm font-medium text-gray">Value</th>
          <th className="py-2 px-4 text-sm font-medium text-gray">
            Description
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">Active Upsells</td>
          <td className="py-2 px-4 font-semibold">125</td>
          <td className="py-2 px-4">
            Test combinations to find the most profitable upsells with the least
            discount impact.
          </td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">Revenue from Upsells</td>
          <td className="py-2 px-4 font-semibold">$120,000</td>
          <td className="py-2 px-4">
            Compare upsell revenue to single-item sales to evaluate the value of
            upsells.
          </td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">Revenue Lost via Discounts</td>
          <td className="py-2 px-4 font-semibold">$25,000</td>
          <td className="py-2 px-4">
            Refine discount strategies to minimize revenue loss while
            maintaining customer value.
          </td>
        </tr>
        <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
          <td className="py-2 px-4 font-medium">Avg. Customer Savings</td>
          <td className="py-2 px-4 font-semibold">$25</td>
          <td className="py-2 px-4">
            Make sure upsells are sustainably boosting profits, not just moving
            stock.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);
