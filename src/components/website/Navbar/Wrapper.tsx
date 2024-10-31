import { getCategories } from "@/lib/api/categories";
import { getCart } from "@/lib/api/cart";
import { cookies } from "next/headers";
import Navbar from ".";

export async function NavbarWrapper() {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;

  const [cart, categoriesData] = await Promise.all([
    getCart(deviceIdentifier),
    getCategories(),
  ]);

  return (
    <Navbar
      itemsInCart={cart ? cart.items.length : 0}
      categories={categoriesData?.categories}
    />
  );
}
