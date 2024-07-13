"use client";

type ProductType = {
  id: string;
  name: string;
  slug: string;
  price: string;
};

export function ProductCard({ product }: { product: ProductType }) {
  const handleClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div
      onClick={() => handleClick("#")}
      className="w-full h-full relative cursor-pointer"
    >
      <div className="absolute left-[10px] right-[10px] bottom-[10px]">
        <div className="text-sm line-clamp-1">{product.name}</div>
        <div className="flex items-center justify-start w-full h-8 mt-[6px]">
          <p className="font-semibold w-max h-5">${product.price}</p>
        </div>
      </div>
    </div>
  );
}
