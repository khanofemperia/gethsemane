import { NewUpsellOverlay } from "@/components/admin/NewUpsell";
import UpsellGrid from "@/components/admin/UpsellGrid";
import { getUpsells } from "@/lib/getData";

export default async function Upsells() {
  const upsells = (await getUpsells()) as UpsellType[];

  return (
    <>
      <UpsellGrid upsells={upsells} />
      <NewUpsellOverlay />
    </>
  );
}
