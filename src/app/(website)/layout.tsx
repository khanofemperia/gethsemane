import Footer from "@/components/website/Footer";
import Navbar from "@/components/website/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="mt-[116px] md:mt-16 min-h-[calc(100vh-116px)] md:min-h-[calc(100vh-64px)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
