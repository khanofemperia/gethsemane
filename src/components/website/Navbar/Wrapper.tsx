import { getCategories } from "@/domains/categories/service";
import { getCart } from "@/domains/cart/service";
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
