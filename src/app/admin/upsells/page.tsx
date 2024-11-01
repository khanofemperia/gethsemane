import { NewUpsellOverlay } from "@/components/admin/NewUpsell";
import UpsellGrid from "@/components/admin/UpsellGrid";
import { getUpsells } from "@/lib/api/upsells";

export default async function Upsells() {
  const upsells = await getUpsells();

  return (
    <>
      <UpsellGrid upsells={upsells} />
      <NewUpsellOverlay />
    </>
  );
}
