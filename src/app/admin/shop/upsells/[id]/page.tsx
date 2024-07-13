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

export default async function EditUpsell({
  params,
}: {
  params: { id: string };
}) {
  const upsell = await getUpsell({ id: params.id }) as UpsellType;

  if (!upsell) {
    notFound();
  }

  const { id, price, salePrice, mainImage, visibility } = upsell as UpsellType;

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
                  <span className="font-bold">
                    ${formatThousands(salePrice)}
                  </span>
                  <span className="text-gray line-through">
                    ${formatThousands(price)}
                  </span>
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
      <BasicDetailsOverlay data={{ id, price, salePrice, mainImage }} />
      <VisibilityOverlay data={{ id, visibility }} />
    </>
  );
}
