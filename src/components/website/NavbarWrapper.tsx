import { getCart } from "@/lib/getData";
import { cookies } from "next/headers";
import Navbar from "./Navbar";

export async function NavbarWrapper() {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;
  const cart = await getCart(deviceIdentifier);

  console.log(cart);
  return <Navbar itemsInCart={cart ? cart.items.length : 0} />;
}
