import {
  BasicDetailsButton,
  BasicDetailsOverlay,
} from "@/components/admin/EditUpsell/BasicDetailsOverlay";
import DataChip from "@/ui/DataChip";
import { formatThousands } from "@/lib/utils";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  VisibilityButton,
  VisibilityOverlay,
} from "@/components/admin/EditUpsell/VisibilityOverlay";
import IDCopyButton from "@/components/shared/IDCopyButton";
import { getUpsell } from "@/lib/getData";
import Link from "next/link";
import { ProductsButton, ProductsOverlay } from "@/components/admin/EditUpsell/ProductsOverlay";

export default async function EditUpsell({
  params,
}: {
  params: { id: string };
}) {
  const upsell = (await getUpsell({ id: params.id })) as UpsellType;

  if (!upsell) {
    notFound();
  }

  const { id, pricing, mainImage, visibility, products } =
    upsell as UpsellType;

  return (
    <>
      <div className="max-w-[768px] flex flex-col gap-10 px-5">
        <div>
          <p className="text-sm mb-4 md:max-w-[85%]">
            Show customers how stuff goes together, and they'll buy more. It's
            that simple. They want a shirt? Display the full outfit - pants,
            shoes, accessories. Soon, we're seeing 2-4 item purchases per sale.
            It's upselling, with a friendly touch.
          </p>
          <div className="w-full shadow rounded-xl bg-white">
            <div className="w-full h-14 border-b flex items-center justify-between pl-5 pr-[10px]">
              <h2 className="font-semibold text-xl">Basic details</h2>
              <BasicDetailsButton />
            </div>
            <div className="flex flex-col gap-5 p-5 pt-4">
              <IDCopyButton id={id} />
              <div>
                <h3 className="text-sm font-semibold mb-2">Pricing</h3>
                <div className="w-max max-w-full h-9 px-4 rounded-full bg-lightgray flex gap-[6px] items-center text-nowrap overflow-x-visible overflow-y-hidden invisible-scrollbar">
                  <span className="font-bold">${formatThousands(pricing.basePrice)}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Main image</h3>
                <div className="w-full max-w-[280px] rounded-xl aspect-square flex items-center justify-center overflow-hidden">
                  <Image
                    src={mainImage}
                    alt="Upsell"
                    width={280}
                    height={280}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm mb-4 md:max-w-[85%]">
            Curate a selection that feels complete, with products that
            complement each other. Mix styles, colors, sizes, and prices so
            everyone finds something they love.
          </p>
          <div className="w-full shadow rounded-xl bg-white">
            <div className="w-full h-14 border-b flex items-center justify-between pl-5 pr-[10px]">
              <h2 className="font-semibold text-xl">
                {products.length ? `Products (${products.length})` : "Products"}
              </h2>
              <ProductsButton />
            </div>
            <div className="p-5 flex flex-wrap justify-start">
              {products.length > 0 ? (
                products
                  .slice(0, 3)
                  .map(({ index, id, slug, mainImage, name, pricing }) => (
                    <Link
                      key={index}
                      href={`/admin/shop/products/${slug}-${id}`}
                      className="aspect-square w-1/2 min-[425px]:w-[calc(100%/3)] md:w-[229px] pt-2 pb-[6px] px-5 select-none transition duration-200 ease-in-out active:bg-blue-100 lg:hover:bg-blue-100"
                    >
                      <div className="relative w-full h-full">
                        <div className="aspect-square w-full overflow-hidden flex items-center justify-center shadow-[2px_2px_4px_#9E9E9E] bg-white">
                          <Image
                            src={mainImage}
                            alt={name}
                            width={216}
                            height={216}
                            priority
                          />
                        </div>
                        <div className="flex items-center justify-center absolute bottom-0 text-sm w-full">
                          <span className="font-bold">
                            ${formatThousands(pricing.basePrice)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
              ) : (
                <p className="italic text-gray">Nothing yet</p>
              )}
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm mb-4 md:max-w-[85%]">
            Choose whether the upsell is a work-in-progress (draft) or ready to
            be seen (published), and decide if you want shoppers to see it or
            keep it private (hidden).
          </p>
          <div className="w-full max-w-[400px] shadow rounded-xl bg-white">
            <div className="w-full h-14 border-b flex items-center justify-between pl-5 pr-[10px]">
              <h2 className="font-semibold text-xl">Visibility</h2>
              <VisibilityButton />
            </div>
            <div className="p-5">
              <DataChip value={visibility as VisibilityType} />
            </div>
          </div>
        </div>
      </div>
      <BasicDetailsOverlay data={{ id, pricing, mainImage }} />
      <VisibilityOverlay data={{ id, visibility }} />
      <ProductsOverlay data={{ id, products }} />
    </>
  );
}
