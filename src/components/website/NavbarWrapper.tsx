import { getCart } from "@/lib/getData";
import Navbar from "./Navbar";

export async function NavbarWrapper() {
  const cart = await getCart();
  return <Navbar cart={cart} />;
}
