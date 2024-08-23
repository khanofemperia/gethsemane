import { getCart } from "@/app/data/getData";
import Navbar from "./Navbar";

export async function NavbarWrapper() {
  const cart = await getCart();
  return <Navbar cart={cart} />;
}
