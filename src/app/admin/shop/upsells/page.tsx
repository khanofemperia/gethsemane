import { NewUpsellOverlay } from "@/components/admin/NewUpsell";
import UpsellGrid from "@/components/admin/UpsellGrid";
import { getUpsells } from "@/app/data/getData";

export default async function Upsells() {
  const upsells = (await getUpsells()) as UpsellType[];

  return (
    <>
      <UpsellGrid upsells={upsells} />
      <NewUpsellOverlay />
    </>
  );
}
