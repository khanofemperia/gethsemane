"use server";

import { cookies } from "next/headers";

/**
 * Retrieve the device identifier from the cookies.
 * 
 * @example Get device identifier from cookies
 * const deviceIdentifier = await getDeviceIdentifier();
 *
 * @returns {Promise<string>} The device identifier string, or an empty string if not found.
 */
export async function getDeviceIdentifier() {
  const cookieStore = cookies();
  return cookieStore.get("device_identifier")?.value ?? "";
}
