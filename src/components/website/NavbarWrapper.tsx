import { getCart, getCategories } from "@/lib/getData";
import { cookies } from "next/headers";
import Navbar from "./Navbar";

export async function NavbarWrapper() {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;

  const [cart, categories] = await Promise.all([
    getCart(deviceIdentifier),
    getCategories(),
  ]);

  return (
    <Navbar
      itemsInCart={cart ? cart.items.length : 0}
      categories={categories}
    />
  );
}
