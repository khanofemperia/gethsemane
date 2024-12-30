import { getCarts } from "@/actions/get/carts";
import { getCategories } from "@/actions/get/categories";
import { getOrders } from "@/actions/get/orders";
import { getProducts } from "@/actions/get/products";
import { formatThousands } from "@/lib/utils/common";
import Link from "next/link";

class StoreGrowthMetrics {
  private orders: OrderType[];

  constructor(orders: OrderType[]) {
    this.orders = orders;
  }

  private getLocalDateForComparison(utcDate: string): string {
    const date = new Date(utcDate);
    const localDate = new Date(date.toLocaleString());
    return `${localDate.getFullYear()}-${(localDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${localDate.getDate().toString().padStart(2, "0")}`;
  }

  private filterOrdersByDate(date: string): OrderType[] {
    return this.orders.filter((order) =>
      this.getLocalDateForComparison(order.timestamp).startsWith(date)
    );
  }

  private filterOrdersByMonth(date: string): OrderType[] {
    return this.orders.filter((order) =>
      this.getLocalDateForComparison(order.timestamp).startsWith(
        date.substring(0, 7)
      )
    );
  }

  private calculateRevenue(orders: OrderType[]): number {
    return orders.reduce(
      (acc, order) => acc + parseFloat(order.amount.value),
      0
    );
  }

  private calculateAOV(orders: OrderType[]): number {
    return orders.length > 0
      ? this.calculateRevenue(orders) / orders.length
      : 0;
  }

  getMetrics() {
    if (!this.orders || this.orders.length === 0) {
      return {
        revenue: { today: 0, thisMonth: 0, allTime: 0 },
        orders: { today: 0, thisMonth: 0, allTime: 0 },
        aov: { today: 0, thisMonth: 0, allTime: 0 },
      };
    }

    const today = this.getLocalDateForComparison(new Date().toISOString());
    const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    const todayOrders = this.filterOrdersByDate(today);
    const thisMonthOrders = this.filterOrdersByMonth(thisMonth);

    const allTimeRevenue = this.calculateRevenue(this.orders);
    const todayRevenue = this.calculateRevenue(todayOrders);
    const thisMonthRevenue = this.calculateRevenue(thisMonthOrders);

    const allTimeAOV = this.calculateAOV(this.orders);
    const todayAOV = this.calculateAOV(todayOrders);
    const thisMonthAOV = this.calculateAOV(thisMonthOrders);

    return {
      revenue: {
        today: todayRevenue,
        thisMonth: thisMonthRevenue,
        allTime: allTimeRevenue,
      },
      orders: {
        today: todayOrders.length,
        thisMonth: thisMonthOrders.length,
        allTime: this.orders.length,
      },
      aov: {
        today: todayAOV,
        thisMonth: thisMonthAOV,
        allTime: allTimeAOV,
      },
    };
  }

  formatRevenue(amount: number): string {
    return `$${formatThousands(amount.toFixed(2))}`;
  }
}

export default async function Overview() {
  const orders = (await getOrders()) as PaymentTransaction[];
  const products = (await getProducts({
    fields: ["visibility", "pricing"],
  })) as ProductType[] | null;
  const carts = await getCarts();

  return (
    <div className="max-w-[812px] flex flex-col gap-10 px-5">
      <div>
        <h2 className="font-semibold text-xl mb-6">Store Growth</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <StoreGrowth orders={orders} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Best-Selling Products</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <BestsellingProducts orders={orders} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Revenue by Category</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <RevenueByCategory orders={orders} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Product Status</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <ProductStatus products={products} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Cart Status Breakdown</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <CartStatusBreakdown carts={carts} />
        </div>
      </div>
    </div>
  );
}

const StoreGrowth = ({ orders }: { orders: OrderType[] | null }) => {
  const storeGrowthMetrics = new StoreGrowthMetrics(orders || []);
  const metrics = storeGrowthMetrics.getMetrics();

  return (
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
            <td className="py-2 px-4 font-semibold">Revenue</td>
            <td
              className={`py-2 px-4 ${
                metrics.revenue.today !== 0
                  ? "text-green-700 font-semibold"
                  : "text-black"
              }`}
            >
              {metrics.revenue.today
                ? storeGrowthMetrics.formatRevenue(metrics.revenue.today)
                : "—"}
            </td>
            <td
              className={`py-2 px-4 ${
                metrics.revenue.thisMonth !== 0
                  ? "text-green-700 font-semibold"
                  : "text-black"
              }`}
            >
              {metrics.revenue.thisMonth
                ? storeGrowthMetrics.formatRevenue(metrics.revenue.thisMonth)
                : "—"}
            </td>
            <td className="py-2 px-4 font-semibold">
              {storeGrowthMetrics.formatRevenue(metrics.revenue.allTime)}
            </td>
          </tr>
          <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
            <td className="py-2 px-4 font-semibold">Orders</td>
            <td className="py-2 px-4">{metrics.orders.today || "—"}</td>
            <td className="py-2 px-4">{metrics.orders.thisMonth || "—"}</td>
            <td className="py-2 px-4">{metrics.orders.allTime || "—"}</td>
          </tr>
          <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
            <td className="py-2 px-4 font-semibold">AOV</td>
            <td className="py-2 px-4">
              {metrics.aov.today
                ? storeGrowthMetrics.formatRevenue(metrics.aov.today)
                : "—"}
            </td>
            <td className="py-2 px-4">
              {metrics.aov.thisMonth
                ? storeGrowthMetrics.formatRevenue(metrics.aov.thisMonth)
                : "—"}
            </td>
            <td className="py-2 px-4">
              {metrics.aov.allTime
                ? storeGrowthMetrics.formatRevenue(metrics.aov.allTime)
                : "—"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const BestsellingProducts = ({
  orders,
}: {
  orders: PaymentTransaction[] | null;
}) => {
  const TOP_PRODUCTS_COUNT = 5;

  const calculateBestSellingProducts = (
    orders: PaymentTransaction[],
    dateFilter: string | null
  ): Record<
    string,
    {
      revenue: number;
      quantity: number;
      name: string;
      slug: string;
      id: string;
    }
  > => {
    const products: Record<
      string,
      {
        revenue: number;
        quantity: number;
        name: string;
        slug: string;
        id: string;
      }
    > = {};

    const isDateMatch = (timestamp: string, filter: string | null) => {
      if (!filter) return true;
      const orderDate = new Date(timestamp).toISOString().split("T")[0];
      return orderDate.startsWith(filter);
    };

    orders.forEach((order) => {
      if (dateFilter && !isDateMatch(order.timestamp, dateFilter)) return;

      order.items.forEach((item) => {
        if (item.type === "upsell") {
          item.products.forEach((product) => {
            const slug = product.slug;
            const orderTotal = parseFloat(order.amount.value);
            const itemCount = order.items.reduce((count, orderItem) => {
              if (orderItem.type === "upsell") {
                return count + orderItem.products.length;
              }
              return count + 1;
            }, 0);
            const revenuePerItem = orderTotal / itemCount;

            if (!products[slug]) {
              products[slug] = {
                revenue: 0,
                quantity: 0,
                name: product.name,
                slug: product.slug,
                id: product.id,
              };
            }
            products[slug].revenue += revenuePerItem;
            products[slug].quantity += 1;
          });
        } else {
          const slug = item.slug;
          const orderTotal = parseFloat(order.amount.value);
          const itemCount = order.items.reduce((count, orderItem) => {
            if (orderItem.type === "upsell") {
              return count + orderItem.products.length;
            }
            return count + 1;
          }, 0);
          const revenuePerItem = orderTotal / itemCount;

          if (!products[slug]) {
            products[slug] = {
              revenue: 0,
              quantity: 0,
              name: item.name,
              slug: item.slug,
              id: item.baseProductId,
            };
          }
          products[slug].revenue += revenuePerItem;
          products[slug].quantity += 1;
        }
      });
    });

    return products;
  };

  const formatRevenue = (amount: number | string): string => {
    const numericAmount =
      typeof amount === "number" ? amount : parseFloat(amount);
    return `$${numericAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const today = new Date().toISOString().split("T")[0];
  const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;

  const bestSellingToday = calculateBestSellingProducts(orders || [], today);
  const bestSellingThisMonth = calculateBestSellingProducts(
    orders || [],
    thisMonth
  );

  const allProducts = Object.entries(bestSellingThisMonth)
    .map(([slug, monthData]) => ({
      id: monthData.id,
      name: monthData.name,
      slug: monthData.slug,
      todayRevenue: bestSellingToday[slug]?.revenue || 0,
      monthRevenue: monthData.revenue,
      monthQuantity: monthData.quantity,
    }))
    .sort((a, b) => b.monthRevenue - a.monthRevenue)
    .slice(0, TOP_PRODUCTS_COUNT);

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sales data available yet
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-neutral-100">
            <th className="py-2 px-4 font-medium text-gray">Product</th>
            <th className="py-2 px-4 font-medium text-gray">Revenue (Today)</th>
            <th className="py-2 px-4 font-medium text-gray">
              Revenue (This Month)
            </th>
            <th className="py-2 px-4 font-medium text-gray">
              Units Sold (This Month)
            </th>
          </tr>
        </thead>
        <tbody>
          {allProducts.map(
            ({ id, name, slug, todayRevenue, monthRevenue, monthQuantity }) => (
              <tr
                key={id}
                className="border-t border-[#dcdfe3] hover:bg-neutral-200"
              >
                <td className="py-2 px-4">
                  <Link
                    href={`/admin/products/${slug}-${id}`}
                    target="_blank"
                    className="underline max-w-48 line-clamp-1"
                  >
                    {name}
                  </Link>
                </td>
                <td className="py-2 px-4">
                  {todayRevenue > 0 ? formatRevenue(todayRevenue) : "—"}
                </td>
                <td className="py-2 px-4 font-semibold text-green-700">
                  {formatRevenue(monthRevenue)}
                </td>
                <td className="py-2 px-4">{monthQuantity}</td>
              </tr>
            )
          )}
          {allProducts.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                No sales yet for this period
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const RevenueByCategory = async ({
  orders,
}: {
  orders: PaymentTransaction[] | null;
}) => {
  // Fetch all categories
  const categoriesData = (await getCategories()) || { categories: [] };
  const products =
    (await getProducts({ fields: ["id", "slug", "category"] })) || [];

  // Create a mapping of slug to category for quick lookups
  const productCategories = products.reduce((acc, product) => {
    if ("slug" in product && "category" in product) {
      // Normalize category names to lowercase when creating the mapping
      acc[product.slug] = product.category.toLowerCase();
    }
    return acc;
  }, {} as Record<string, string>);

  const calculateRevenueByCategory = (
    orders: PaymentTransaction[],
    dateFilter: string | null
  ): Record<string, { revenue: number; category: string }> => {
    // Initialize all categories with zero revenue
    const categoryRevenue: Record<
      string,
      { revenue: number; category: string }
    > = {};

    // Initialize known categories - normalize to lowercase
    categoriesData.categories.forEach((category) => {
      const normalizedName = category.name.toLowerCase();
      categoryRevenue[normalizedName] = {
        revenue: 0,
        category: category.name, // Keep original case for display
      };
    });

    const isDateMatch = (timestamp: string, filter: string | null) => {
      if (!filter) return true;
      const orderDate = new Date(timestamp).toISOString().split("T")[0];
      return orderDate.startsWith(filter);
    };

    orders?.forEach((order) => {
      if (dateFilter && !isDateMatch(order.timestamp, dateFilter)) return;

      const orderTotal = parseFloat(order.amount.value);
      const itemCount = order.items.reduce((count, orderItem) => {
        if (orderItem.type === "upsell") {
          return count + orderItem.products.length;
        }
        return count + 1;
      }, 0);
      const revenuePerItem = orderTotal / itemCount;

      order.items.forEach((item) => {
        if (item.type === "upsell") {
          item.products.forEach((product) => {
            const category = (
              productCategories[product.slug] || "uncategorized"
            ).toLowerCase();
            // Initialize category if it doesn't exist
            if (!categoryRevenue[category]) {
              categoryRevenue[category] = {
                revenue: 0,
                category: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize for display
              };
            }
            categoryRevenue[category].revenue += revenuePerItem;
          });
        } else {
          const category = (
            productCategories[item.slug] || "uncategorized"
          ).toLowerCase();
          // Initialize category if it doesn't exist
          if (!categoryRevenue[category]) {
            categoryRevenue[category] = {
              revenue: 0,
              category: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize for display
            };
          }
          categoryRevenue[category].revenue += revenuePerItem;
        }
      });
    });

    return categoryRevenue;
  };

  const formatRevenue = (amount: number): string => {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercentage = (amount: number, total: number): string => {
    return total === 0
      ? "—"
      : amount === 0
      ? "0"
      : `${((amount / total) * 100).toFixed(1)}%`;
  };

  const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;

  const monthlyRevenue = calculateRevenueByCategory(orders || [], thisMonth);
  const allTimeRevenue = calculateRevenueByCategory(orders || [], null);

  const totalMonthlyRevenue = Object.values(monthlyRevenue).reduce(
    (acc, { revenue }) => acc + revenue,
    0
  );

  const sortedCategories = Object.entries(allTimeRevenue)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .map(([name, data]) => ({
      name,
      category: data.category,
      monthRevenue: monthlyRevenue[name]?.revenue || 0,
      allTimeRevenue: data.revenue,
    }));

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No orders available</div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-neutral-100">
            <th className="py-2 px-4 font-medium text-gray">Category</th>
            <th className="py-2 px-4 font-medium text-gray">
              Revenue (This Month)
            </th>
            <th className="py-2 px-4 font-medium text-gray">
              All-Time Revenue
            </th>
            <th className="py-2 px-4 font-medium text-gray">Contribution</th>
          </tr>
        </thead>
        <tbody>
          {sortedCategories.map(
            ({ name, category, monthRevenue, allTimeRevenue }) => (
              <tr
                key={name}
                className="border-t border-[#dcdfe3] hover:bg-neutral-200"
              >
                <td className="py-2 px-4 font-medium">{category}</td>
                <td
                  className={`py-2 px-4 ${
                    monthRevenue > 0 ? "text-green-700 font-semibold" : ""
                  }`}
                >
                  {monthRevenue > 0 ? formatRevenue(monthRevenue) : "—"}
                </td>
                <td className="py-2 px-4">
                  {allTimeRevenue > 0 ? formatRevenue(allTimeRevenue) : "—"}
                </td>
                <td
                  className={`py-2 px-4 ${
                    monthlyRevenue[name]?.revenue > 0 &&
                    formatPercentage(monthRevenue, totalMonthlyRevenue) !== "0"
                      ? "text-green-700 font-semibold"
                      : ""
                  }`}
                >
                  {formatPercentage(monthRevenue, totalMonthlyRevenue)}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

const ProductStatus = ({ products }: { products: ProductType[] | null }) => {
  if (!products) {
    return null;
  }

  const activeProducts = products.filter((p) => p.visibility === "PUBLISHED");
  const hiddenProducts = products.filter((p) => p.visibility !== "PUBLISHED");

  return (
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
            <td className="py-2 px-4 font-semibold">{activeProducts.length}</td>
            <td className="py-2 px-4">Currently available for sale.</td>
          </tr>
          <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
            <td className="py-2 px-4 font-medium text-yellow-700">
              <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                Hidden
              </span>
            </td>
            <td className="py-2 px-4 font-semibold">{hiddenProducts.length}</td>
            <td className="py-2 px-4">Awaiting restock or clearance.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// const CartStatusBreakdown = ({
//   carts,
//   products,
// }: {
//   carts: CartType[];
//   products: ProductType[] | null;
// }) => {
//   console.log(carts);
//   return (
//     <div className="rounded-md border overflow-hidden">
//       <table className="w-full text-left text-sm">
//         <thead>
//           <tr className="bg-neutral-100">
//             <th className="py-2 px-4 font-medium text-gray">Status</th>
//             <th className="py-2 px-4 font-medium text-gray">Cart Count</th>
//             <th className="py-2 px-4 font-medium text-gray">Total Value</th>
//             <th className="py-2 px-4 font-medium text-gray">Description</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
//             <td className="py-2 px-4 font-medium text-green-700">
//               <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
//                 Active
//               </span>
//             </td>
//             <td className="py-2 px-4 font-semibold">234</td>
//             <td className="py-2 px-4 font-semibold">$15,680</td>
//             <td className="py-2 px-4">Carts within &lt; 24 hours.</td>
//           </tr>
//           <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
//             <td className="py-2 px-4 font-medium text-yellow-700">
//               <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
//                 Idle
//               </span>
//             </td>
//             <td className="py-2 px-4 font-semibold">567</td>
//             <td className="py-2 px-4 font-semibold">$42,560</td>
//             <td className="py-2 px-4">Carts inactive for 1-7 days.</td>
//           </tr>
//           <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
//             <td className="py-2 px-4 font-medium text-gray-700">
//               <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
//                 Abandoned
//               </span>
//             </td>
//             <td className="py-2 px-4 font-semibold">890</td>
//             <td className="py-2 px-4 font-semibold">$67,450</td>
//             <td className="py-2 px-4">Carts abandoned for 7-30 days.</td>
//           </tr>
//           <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
//             <td className="py-2 px-4 font-medium">
//               <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
//                 Dead
//               </span>
//             </td>
//             <td className="py-2 px-4 font-semibold">1,234</td>
//             <td className="py-2 px-4 font-semibold">$98,760</td>
//             <td className="py-2 px-4">Carts older than 30 days.</td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const CartStatusBreakdown = ({ carts }: { carts: CartType[] }) => {
//   const determineCartStatus = (updatedAt: string) => {
//     const now = new Date();
//     const updatedDate = new Date(updatedAt);
//     const differenceInMs = now.getTime() - updatedDate.getTime();
//     const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

//     if (differenceInDays < 1) {
//       return "Active";
//     } else if (differenceInDays >= 1 && differenceInDays <= 7) {
//       return "Idle";
//     } else if (differenceInDays > 7 && differenceInDays <= 30) {
//       return "Abandoned";
//     } else {
//       return "Dead";
//     }
//   };

//   const statusCounts = carts.reduce(
//     (acc, cart) => {
//       const status = determineCartStatus(cart.updatedAt);
//       acc[status] = (acc[status] || 0) + 1;
//       return acc;
//     },
//     { Active: 0, Idle: 0, Abandoned: 0, Dead: 0 }
//   );

//   console.log(statusCounts);

// return <div className="rounded-md border overflow-hidden">
//   <table className="w-full text-left text-sm">
//     <thead>
//       <tr className="bg-neutral-100">
//         <th className="py-2 px-4 font-medium text-gray">Status</th>
//         <th className="py-2 px-4 font-medium text-gray">Cart Count</th>
//         <th className="py-2 px-4 font-medium text-gray">Total Value</th>
//         <th className="py-2 px-4 font-medium text-gray">Description</th>
//       </tr>
//     </thead>
//     <tbody>
//       <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
//         <td className="py-2 px-4 font-medium text-green-700">
//           <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
//             Active
//           </span>
//         </td>
//         <td className="py-2 px-4 font-semibold">234</td>
//         <td className="py-2 px-4 font-semibold">$15,680</td>
//         <td className="py-2 px-4">Carts within &lt; 24 hours.</td>
//       </tr>
//       <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
//         <td className="py-2 px-4 font-medium text-yellow-700">
//           <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
//             Idle
//           </span>
//         </td>
//         <td className="py-2 px-4 font-semibold">567</td>
//         <td className="py-2 px-4 font-semibold">$42,560</td>
//         <td className="py-2 px-4">Carts inactive for 1-7 days.</td>
//       </tr>
//       <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
//         <td className="py-2 px-4 font-medium text-gray-700">
//           <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
//             Abandoned
//           </span>
//         </td>
//         <td className="py-2 px-4 font-semibold">890</td>
//         <td className="py-2 px-4 font-semibold">$67,450</td>
//         <td className="py-2 px-4">Carts abandoned for 7-30 days.</td>
//       </tr>
//       <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
//         <td className="py-2 px-4 font-medium">
//           <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
//             Dead
//           </span>
//         </td>
//         <td className="py-2 px-4 font-semibold">1,234</td>
//         <td className="py-2 px-4 font-semibold">$98,760</td>
//         <td className="py-2 px-4">Carts older than 30 days.</td>
//       </tr>
//     </tbody>
//   </table>
// </div>;
// };

const CartStatusBreakdown = ({ carts }: { carts: CartType[] }) => {
  const determineCartStatus = (updatedAt: string) => {
    const now = new Date();
    const updatedDate = new Date(updatedAt);
    const differenceInMs = now.getTime() - updatedDate.getTime();
    const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

    if (differenceInDays < 1) {
      return "Active";
    } else if (differenceInDays >= 1 && differenceInDays <= 7) {
      return "Idle";
    } else if (differenceInDays > 7 && differenceInDays <= 30) {
      return "Abandoned";
    } else {
      return "Dead";
    }
  };

  const statusCounts = carts.reduce(
    (acc, cart) => {
      const status = determineCartStatus(cart.updatedAt);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { Active: 0, Idle: 0, Abandoned: 0, Dead: 0 }
  );

  return (
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
            <td className="py-2 px-4 font-semibold">{statusCounts.Active}</td>
            <td className="py-2 px-4 font-semibold">$15,680</td>
            <td className="py-2 px-4">Carts within &lt; 24 hours.</td>
          </tr>
          <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
            <td className="py-2 px-4 font-medium text-yellow-700">
              <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                Idle
              </span>
            </td>
            <td className="py-2 px-4 font-semibold">{statusCounts.Idle}</td>
            <td className="py-2 px-4 font-semibold">$42,560</td>
            <td className="py-2 px-4">Carts inactive for 1-7 days.</td>
          </tr>
          <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
            <td className="py-2 px-4 font-medium text-gray-700">
              <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                Abandoned
              </span>
            </td>
            <td className="py-2 px-4 font-semibold">
              {statusCounts.Abandoned}
            </td>
            <td className="py-2 px-4 font-semibold">$67,450</td>
            <td className="py-2 px-4">Carts abandoned for 7-30 days.</td>
          </tr>
          <tr className="border-t border-[#dcdfe3] hover:bg-neutral-200">
            <td className="py-2 px-4 font-medium">
              <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                Dead
              </span>
            </td>
            <td className="py-2 px-4 font-semibold">{statusCounts.Dead}</td>
            <td className="py-2 px-4 font-semibold">$98,760</td>
            <td className="py-2 px-4">Carts older than 30 days.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// -- Type Definitions --

type ProductInUpsell = {
  mainImage: string;
  index: number;
  basePrice: number;
  color: string;
  id: string;
  size: string;
  slug: string;
  name: string;
};

type PaymentTransaction = {
  id: string;
  status: string;
  transactionId: string;
  timestamp: string;
  amount: {
    currency: string;
    value: string;
  };
  payer: {
    email: string;
    payerId: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
  shipping: {
    name: string;
    address: {
      line1: string;
      state: string;
      country: string;
      city: string;
      postalCode: string;
    };
  };
  items: Array<
    | {
        slug: string;
        type: "product";
        mainImage: string;
        pricing: {
          basePrice: number;
          salePrice: number;
          discountPercentage: number;
        };
        color: string;
        size: string;
        index: number;
        baseProductId: string;
        variantId: string;
        name: string;
      }
    | {
        mainImage: string;
        index: number;
        pricing: {
          basePrice: number;
          salePrice: number;
          discountPercentage: number;
        };
        products: ProductInUpsell[];
        type: "upsell";
        baseUpsellId: string;
        variantId: string;
      }
  >;
  emails: {
    confirmed: {
      sentCount: number;
      maxAllowed: number;
      lastSent: string | null;
    };
    shipped: {
      sentCount: number;
      maxAllowed: number;
      lastSent: string | null;
    };
    delivered: {
      sentCount: number;
      maxAllowed: number;
      lastSent: string | null;
    };
  };
};
