// lib/get-user.server.ts
// server-side cookie read + JSON parse
import { cookies } from "next/headers";
import type { VivoUserSessionDetails } from "@/types";

/**
 * Reads the 'vivoUser' cookie on the server
 * and parses it into your session-details type.
 */
export async function getUserFromServer(): Promise<VivoUserSessionDetails | null> {
  // Await the cookies() function to get the actual cookie store object
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("vivoUser");
  if (!userCookie) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(userCookie.value));
    return parsed as VivoUserSessionDetails;
  } catch (err) {
    console.error("Invalid server-side cookie format", err);
    return null;
  }
}
