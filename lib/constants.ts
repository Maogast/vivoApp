// lib/constants.ts
import { Buffer } from "buffer";

export const VIVO_LOGO = "/images/vivo.jpg";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_USERNAME = process.env.NEXT_PUBLIC_API_USERNAME;
const API_PASSWORD = process.env.NEXT_PUBLIC_API_PASSWORD;

if (!API_BASE_URL || !API_USERNAME || !API_PASSWORD) {
  throw new Error(
    "[config] Missing NEXT_PUBLIC_API_* env vars at build time. Aborting build."
  );
}

export { API_BASE_URL };

export const API_AUTHORIZATION = `Basic ${Buffer.from(
  `${API_USERNAME}:${API_PASSWORD}`
).toString("base64")}`;
