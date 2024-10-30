import Footer from "@/components/website/Footer";
import { NavbarWrapper } from "@/components/website/Navbar/Wrapper";

export default async function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavbarWrapper />
      <main className="mt-[108px] md:mt-[56px] min-h-[calc(100vh-116px)] md:min-h-[calc(100vh-64px)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
