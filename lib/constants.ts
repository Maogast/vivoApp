//lib/constants.ts
import { Buffer } from 'buffer'

/** Logo asset path */
export const VIVO_LOGO = '/images/vivo.jpg'

/**
 * Base URL for all OData V4 endpoints.
 * Should include the `/ODataV4/Company('VIVO')` segment.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://vivo3.bitsnke.co.ke/VIVOAPI/ODataV4/Company('VIVO')"

const username = process.env.NEXT_PUBLIC_API_USERNAME
const password = process.env.NEXT_PUBLIC_API_PASSWORD

if (!username || !password) {
  console.warn(
    '[constants] NEXT_PUBLIC_API_USERNAME or NEXT_PUBLIC_API_PASSWORD is not set'
  )
}

export const API_AUTHORIZATION = username && password
  ? `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
  : ''
