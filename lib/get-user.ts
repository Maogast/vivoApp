// lib/get-user.ts
// This file serves as the primary user data retrieval function,
// intended for use in Server Components or API routes.
// Client Components should directly import from '@/lib/get-user.client'.

import { getUserFromServer } from "./get-user.server";
import type { VivoUserSessionDetails } from "@/types";

/**
 * Retrieves user data. This function is designed to be called in a server environment.
 * For client-side user data retrieval, use `getUserFromClient` from `get-user.client.ts`.
 */
export async function getUserData(): Promise<VivoUserSessionDetails | null> {
  return getUserFromServer();
}
