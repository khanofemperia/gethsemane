"use server";

import { cookies } from "next/headers";

export async function getDeviceIdentifier() {
  const cookieStore = cookies();
  return cookieStore.get("device_identifier")?.value ?? "";
}
