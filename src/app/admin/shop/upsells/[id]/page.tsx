import {
  BasicDetailsButton,
  BasicDetailsOverlay,
} from "@/components/admin/EditUpsell/BasicDetailsOverlay";
import DataChip from "@/ui/DataChip";
import { formatThousands, isValidRemoteImage } from "@/lib/utils";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  VisibilityButton,
  VisibilityOverlay,
} from "@/components/admin/EditUpsell/VisibilityOverlay";
import IDCopyButton from "@/components/shared/IDCopyButton";
import { getUpsell } from "@/lib/getData";
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
                        <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-[10px] px-[5px] flex items-center justify-center">
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
                      {isValidRemoteImage(mainImage) && (
                        <Image
                          src={mainImage}
                          alt="Upsell"
                          width={280}
                          height={280}
                          priority
                        />
                      )}
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
            <h2 className="font-semibold text-xl mb-3">Visibility</h2>
            <p className="text-sm md:max-w-[85%]">
              Published or hidden? Choose if your creation is visible on the
              public website.
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
      <BasicDetailsOverlay data={{ id, pricing, mainImage, products }} />
      <VisibilityOverlay data={{ id, visibility }} />
    </>
  );
}
