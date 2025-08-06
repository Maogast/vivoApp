// lib/get-user.client.ts
// client-only cookie read + JSON parse
import type { VivoUserSessionDetails } from "@/types";
import Cookies from "js-cookie";

export function getUserFromClient(): VivoUserSessionDetails | null {
  // Ensure this code only runs in a browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  const serialized = Cookies.get("vivoUser");
  if (!serialized) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(serialized));
    return parsed as VivoUserSessionDetails;
  } catch {
    console.error("Error parsing client-side user cookie.");
    return null;
  }
}
