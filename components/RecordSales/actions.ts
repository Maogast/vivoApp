// components/RecordSales/actions.ts
// This file contains server‐side actions related to sales headers.
// It includes functionality to create a new sales header and delete an existing one.

'use server'

import { createData } from "@/lib/api"
import { API_BASE_URL } from "@/lib/constants"

/**
 * Creates a new sales header on the back end.
 * @param initialState  any initial state you may want to pass through
 * @param formData      the FormData from your RecordSalesForm
 */
export async function createSalesHeader(initialState: any, formData: FormData) {
  try {
    const payload = {
      "@odata.etag": formData.get("@odata.etag"),
      Region_Code:    formData.get("Region_Code"),
      Outlet_Code:    formData.get("Outlet_Code"),
    }

    console.log("PAYLOAD", payload)

    // The createData helper already handles the fetch call and error checking (res.ok)
    // and returns the parsed JSON data directly.
    // So, 'res' here is already the JSON response, not the raw Fetch Response object.
    const data = await createData(`${API_BASE_URL}/NewSalesHeader`, payload)
    console.log("RESPONSE/DATA:", data)

    // Removed the problematic 'if (!res.ok)' block.
    // If createData fails (e.g., non-2xx response), it will throw an error,
    // which will be caught by the outer try-catch block.

    return {
      success: true,
      data,
    }
  } catch (err: any) {
    console.error("Error creating sales header:", err) // Log the actual error for debugging
    return { success: false, error: err.message }
  }
}


/**
 * Deletes a sales header by its document number.
 * @param docNo  the sales header document number (e.g. "NS-00123")
 */
export async function deleteSalesHeader(docNo: string) {
  try {
    const url = `${API_BASE_URL}/NewSalesHeader('${docNo}')`
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        // If you’re using token auth, include it here:
        // Authorization: API_AUTHORIZATION, // Uncomment if server actions need auth here
      },
    })

    console.log(`DELETE ${url} → ${res.status}`)

    if (!res.ok) {
      throw new Error(`Failed to delete sales header (HTTP ${res.status})`)
    }

    return { success: true }
  } catch (err: any) {
    console.error("deleteSalesHeader error:", err)
    return { success: false, error: err.message }
  }
}
