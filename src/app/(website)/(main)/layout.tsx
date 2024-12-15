import { Footer } from "@/components/website/Footer";
import { MobileNavbarOverlay } from "@/components/website/MobileNavbarOverlay";
import { NavbarWrapper } from "@/components/website/Navbar/Wrapper";

export default async function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavbarWrapper />
      <main className="pt-[65px] md:pt-[57px] min-h-[calc(100vh-328px)]">
        {children}
      </main>
      <Footer />
      <MobileNavbarOverlay />
    </>
  );
}
