export default function Overlay({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="overlay fixed top-0 bottom-0 left-0 right-0 z-50 transition duration-300 ease-in-out bg-glass-black backdrop-blur-sm md:overflow-x-hidden md:overflow-y-visible md:custom-scrollbar">
      {children}
    </div>
  );
}
