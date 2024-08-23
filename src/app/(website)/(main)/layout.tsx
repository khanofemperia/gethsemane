import Footer from "@/components/website/Footer";
import { NavbarWrapper } from "@/components/website/NavbarWrapper";

export default async function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavbarWrapper />
      <main className="mt-[116px] md:mt-16 min-h-[calc(100vh-116px)] md:min-h-[calc(100vh-64px)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
