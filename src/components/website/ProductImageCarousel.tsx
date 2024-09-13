import Image from "next/image";

export function ProductImageCarousel() {
  return (
    <div className="custom-scrollbar flex justify-center py-20 w-screen h-screen overflow-x-hidden overflow-y-visible z-40 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="h-max max-h-[calc(764px-80px)] w-max max-w-[1024px] p-10 relative overflow-hidden shadow rounded-2xl bg-white">
        <div className="grid grid-cols-[436px_320px] gap-5">
          <div className="w-[436px] h-[436px] items-center justify-center overflow-hidden">
            <Image
              src="https://img.kwcdn.com/product/fancy/f3f85e4f-63f1-4e12-b182-2ea81cbe081e.jpg?imageView2/2/w/800/q/70/format/webp"
              alt="Double Breasted Lapel Teddy Coat, Versatile Long Sleeve Textured Thermal Winter Outerwear, Women's Clothing"
              width={480}
              height={480}
              priority
            />
          </div>
          <div className="h-full w-[320px] bg-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
