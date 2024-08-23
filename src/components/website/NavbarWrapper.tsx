import { getCart } from "@/lib/getData";
import { cookies } from "next/headers";
import Navbar from "./Navbar";

export async function NavbarWrapper() {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;
  const cart = await getCart(deviceIdentifier);

  return <Navbar itemsInCart={cart ? cart.products.length : 0} />;
}
