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
import {
  ProductsButton,
  ProductsOverlay,
} from "@/components/admin/EditUpsell/ProductsOverlay";
import clsx from "clsx";

export default async function EditUpsell({
  params,
}: {
  params: { id: string };
}) {
  const upsell = (await getUpsell({ id: params.id })) as UpsellType;

  if (!upsell) {
    notFound();
  }

  const { id, pricing, mainImage, visibility, products } = upsell as UpsellType;

  return (
    <>
      <div className="max-w-[768px] flex flex-col gap-10 px-5">
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Basic details</h2>
            <p className="text-sm md:max-w-[85%]">
              Show customers how stuff goes together, and they'll buy more. If
              they want a shirt, display the full outfit—pants, shoes,
              accessories. Before you know it, they'll be adding 2-4 items to
              their cart. It's upselling, but in a friendly way.
            </p>
          </div>
          <div
            className={clsx(
              "w-full max-w-[400px] relative flex items-center justify-between shadow rounded-xl bg-white",
              {
                "p-5 pr-2": !(pricing.basePrice && mainImage),
              }
            )}
          >
            {pricing.basePrice && mainImage ? (
              <div className="w-full">
                <div className="w-[calc(100%-60px)]">
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-2">Price</h3>
                    {Number(pricing.salePrice) ? (
                      <div className="flex items-center gap-[6px]">
                        <span className="font-medium">
                          ${formatThousands(Number(pricing.salePrice))}
                        </span>
                        <span className="text-xs text-gray line-through mt-[2px]">
                          ${formatThousands(Number(pricing.basePrice))}
                        </span>
                        <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-3 py-1 px-[5px]">
                          -{pricing.discountPercentage}%
                        </span>
                      </div>
                    ) : (
                      <p className="font-medium">
                        ${formatThousands(Number(pricing.basePrice))}
                      </p>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-2">Main image</h3>
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
                <div className="w-full p-5 pt-2 pb-10 flex justify-center">
                  <IDCopyButton id={id} />
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <BasicDetailsButton
              className={clsx({
                "absolute top-2 right-2": pricing.basePrice && mainImage,
              })}
            />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">
              Products {products.length ? `(${products.length})` : null}
            </h2>
            <p className="text-sm md:max-w-[85%]">
              Curate a selection that feels complete, with products that
              complement each other. Mix styles, colors, sizes, and prices so
              everyone finds something they love.
            </p>
          </div>
          <div
            className={clsx(
              "w-full relative flex items-center justify-between shadow rounded-xl bg-white",
              {
                "p-5 pr-2": !(products.length > 0),
              }
            )}
          >
            {products.length > 0 ? (
              <div className="w-[calc(100%-60px)]">
                <div className="p-5 flex flex-wrap justify-start">
                  {products.length > 0 ? (
                    products
                      .slice(0, 3)
                      .map(
                        ({ index, id, slug, mainImage, name, basePrice }) => (
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
                                  ${formatThousands(basePrice)}
                                </span>
                              </div>
                            </div>
                          </Link>
                        )
                      )
                  ) : (
                    <p className="italic text-gray">Nothing yet</p>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <ProductsButton
              className={clsx({
                "absolute top-2 right-2": products.length > 0,
              })}
            />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Visibility</h2>
            <p className="text-sm md:max-w-[85%]">
              Choose whether the upsell is a work-in-progress (draft) or ready
              to be seen (published), and decide if you want shoppers to see it
              or keep it private (hidden).
            </p>
          </div>
          <div className="w-full max-w-[400px] relative shadow rounded-xl bg-white">
            <div className="relative border rounded-xl pl-5 pr-[10px] py-4">
              <div className="w-full flex items-center justify-between">
                <DataChip value={visibility as VisibilityType} />
                <VisibilityButton />
              </div>
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
