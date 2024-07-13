import { NewUpsellOverlay } from "@/components/admin/NewUpsell";
import UpsellGrid from "@/components/admin/UpsellGrid";
import { fetchData } from "@/libraries/utils";

export default async function Upsells() {
  const upsells = await fetchData<UpsellType[]>({path: "/api/admin/upsells"});

  return (
    <>
      <UpsellGrid upsells={upsells} />
      <NewUpsellOverlay />
    </>
  );
}
