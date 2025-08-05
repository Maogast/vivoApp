import { API_AUTHORIZATION } from './constants'
import { endpoints } from './endpoints'

/**
 * Interface representing a single sales line item.
 */
export interface SalesLine {
  No: string
  SN: number
  Officer_Name: string
  Role_Name: string
  Product_Code?: string
  Target: number
  SKU_Code?: string
  SKU_Liters: number
  Grade: string
  Quantity: number
  Total: number
  SKU_Ratio: number
  Commission_Earned: number
  '@odata.etag': string
  isUpdating: boolean
}

/**
 * Interface for Vivo products.
 */
export interface VivoProduct {
  Code: string
  Description: string
}

/**
 * Interface for Product SKUs.
 */
export interface ProductSKU {
  SKU_Code: string
  SKU_Name: string
}

export interface ApprovalResult {
  SN: number
  Code: string
}

/**
 * Interface for the new Approved Sales List records.
 */
export interface NewApprovedSalesRecord {
  No: string
  Region_Code: string
  Region_Name: string
  Outlet_Code: string
  Outlet_Name: string
  Sale_Date: string
  Date_Captured: string
  Time_Captured: string
  Total_Target: number
  Total_Commission_Earned: number
  Status: string
}

/**
 * Represents the header row of a sales record
 */
export interface VivoSalesHeader {
  "@odata.etag": string
  No: string
  Date_Captured: string
  Time_Captured: string
  Sales_Date: string
  Region_Code: string
  Region_Name: string
  Outlet_Code: string
  Outlet_Name: string
  Total_Target: number
  Total_Achieved: number
  Total_Commission_Earned: number
  Status: string
}

/**
 * Generic GET helper with no-store caching and automatic Basic auth.
 */
export async function fetchData<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    method: options.method || 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_AUTHORIZATION,
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    console.error(`[fetchData] HTTP ${res.status}:`, await res.text())
    throw new Error(`fetchData failed: ${res.status}`)
  }

  return res.json()
}

/**
 * Generic POST helper with no-store caching and automatic Basic auth.
 */
export async function createData<T = any, U = any>(
  url: string,
  payload: T,
  options: RequestInit = {}
): Promise<U> {
  const res = await fetch(url, {
    method: options.method || 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_AUTHORIZATION,
      ...(options.headers || {}),
    },
    body: JSON.stringify(payload),
    ...options,
  })

  if (!res.ok) {
    console.error(`[createData] HTTP ${res.status}:`, await res.text())
    throw new Error(`createData failed: ${res.status}`)
  }

  if (res.status === 204) {
    return {} as U
  }

  return res.json()
}

/**
 * Generic PATCH helper with no-store caching and automatic Basic auth.
 */
export async function updateData<T = any, U = any>(
  url: string,
  payload: T,
  options: RequestInit = {}
): Promise<U> {
  const res = await fetch(url, {
    method: options.method || 'PATCH',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_AUTHORIZATION,
      ...(options.headers || {}),
    },
    body: JSON.stringify(payload),
    ...options,
  })

  if (!res.ok) {
    console.error(`[updateData] HTTP ${res.status}:`, await res.text())
    throw new Error(`updateData failed: ${res.status}`)
  }

  if (res.status === 204) {
    return {} as U
  }

  return res.json()
}

/**
 * Generic DELETE helper with no-store caching and automatic Basic auth.
 */
export async function deleteData<U = any>(
  url: string,
  options: RequestInit = {}
): Promise<U> {
  const res = await fetch(url, {
    method: options.method || 'DELETE',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_AUTHORIZATION,
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    console.error(`[deleteData] HTTP ${res.status}:`, await res.text())
    throw new Error(`deleteData failed: ${res.status}`)
  }

  if (res.status === 204) {
    return {} as U
  }

  return res.json()
}

// =======================================================
// NEW API FUNCTIONS
// These functions correctly handle adding, updating, and deleting
// sales lines using the `NewSalesLines` endpoint.
// =======================================================

/**
 * Fetches all Vivo products.
 */
export async function fetchVivoProducts(): Promise<VivoProduct[]> {
  const url = endpoints.lookup.vivoProducts();
  const res = await fetchData<{ value: VivoProduct[] }>(url);
  return res.value;
}

/**
 * Fetches all Lubricant SKUs.
 */
export async function fetchLubricantSKUs(): Promise<ProductSKU[]> {
  const url = endpoints.lookup.lubricantSKUs();
  const res = await fetchData<{ value: ProductSKU[] }>(url);
  return res.value;
}

/**
 * Fetches the sales lines for a given sale number.
 */
export async function fetchSalesLines(saleNo: string): Promise<SalesLine[]> {
  const url = endpoints.recordSales.newSalesLines(saleNo);
  const res = await fetchData<{ value: SalesLine[] }>(url);
  return res.value.map(row => ({ ...row, isUpdating: false }));
}

/**
 * Adds a new sales line to a sale.
 * @param saleNo The sale number to which the new line will be added.
 * @returns The newly created sales line object from the API.
 */
export async function addSalesLine(saleNo: string): Promise<SalesLine> {
  const url = endpoints.recordSales.newSalesLines();
  const payload = { No: saleNo };
  const newLine = await createData<typeof payload, SalesLine>(url, payload);
  return { ...newLine, isUpdating: false };
}

/**
 * Updates a specific sales line item.
 * @param saleNo The sale number.
 * @param sn The serial number of the line item.
 * @param payload The fields to update.
 * @param etag The OData ETag for optimistic concurrency control.
 * @returns The updated sales line object from the API.
 */
export async function updateSalesLine(
  saleNo: string,
  sn: number,
  payload: Partial<SalesLine>,
  etag: string
): Promise<SalesLine> {
  const url = endpoints.recordSales.salesLineItem(saleNo, sn);
  const updatedLine = await updateData<Partial<SalesLine>, SalesLine>(url, payload, {
    headers: { 'If-Match': etag },
  });
  return { ...updatedLine, isUpdating: false };
}

/**
 * Deletes a specific sales line item.
 * @param saleNo The sale number.
 * @param sn The serial number of the line item.
 * @param etag The OData ETag for optimistic concurrency control.
 */
export async function deleteSalesLine(
  saleNo: string,
  sn: number,
  etag: string
): Promise<void> {
  const url = endpoints.recordSales.salesLineItem(saleNo, sn);
  await deleteData(url, {
    headers: { 'If-Match': etag },
  });
}

/**
 * Fetches the new approved sales list with region and outlet filters.
 * @param regionCode The region code to filter by.
 * @param outletCode The outlet code to filter by.
 * @returns A promise that resolves to an array of VivoSalesHeader objects.
 */
export async function fetchNewApprovedSalesList(
  regionCode: string,
  outletCode: string
): Promise<VivoSalesHeader[]> {
  const url = endpoints.lookup.newApprovedSalesList(regionCode, outletCode);
  const res = await fetchData<{ value: NewApprovedSalesRecord[] }>(url);
  // Map the NewApprovedSalesRecord to the expected VivoSalesHeader format
  return res.value.map(item => ({
    "@odata.etag": "", // Etag is not present in this endpoint, so we default to an empty string
    No: item.No,
    Date_Captured: item.Date_Captured,
    Time_Captured: item.Time_Captured,
    Sales_Date: item.Sale_Date,
    Region_Code: item.Region_Code,
    Region_Name: item.Region_Name,
    Outlet_Code: item.Outlet_Code,
    Outlet_Name: item.Outlet_Name,
    Total_Target: item.Total_Target,
    Total_Achieved: item.Total_Target, // Achieved is not in the API response, so we mirror Target
    Total_Commission_Earned: item.Total_Commission_Earned,
    Status: item.Status,
  }));
}

// =======================================================
// EXISTING FUNCTIONS (Moved for clarity, logic is unchanged)
// =======================================================

/**
 * Invoke the unbound SendRequestForApproval OData action.
 */
export async function submitForApproval(
  code: string,
  etag?: string
): Promise<ApprovalResult> {
  const url = endpoints.actions.sendRequestForApproval()
  const payload = { Code: code }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: API_AUTHORIZATION,
    ...(etag ? { 'If-Match': etag } : {}),
  }

  const res = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`[submitForApproval] HTTP ${res.status}:`, text)
    throw new Error(`submitForApproval failed (${res.status}): ${text}`)
  }

  if (res.status === 204) {
    return {} as ApprovalResult
  }

  return res.json()
}

/**
 * Invoke the unbound ReturnBackToOpen OData action.
 */
export async function returnBackToOpen(code: string): Promise<void> {
  const url = endpoints.actions.returnBackToOpen()
  const payload = { Code: code }

  const res = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_AUTHORIZATION,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`[returnBackToOpen] HTTP ${res.status}:`, text)
    throw new Error(`returnBackToOpen failed (${res.status}): ${text}`)
  }
}

/**
 * Invoke the unbound ApproveRequest OData action.
 */
export async function approveRequest(code: string): Promise<void> {
  const url = endpoints.actions.approveRequest()
  const payload = { Code: code }

  const res = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_AUTHORIZATION,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`[approveRequest] HTTP ${res.status}:`, text)
    throw new Error(`approveRequest failed (${res.status}): ${text}`)
  }
}

/**
 * Invoke the unbound RejectRequest OData action.
 * This version has been updated to match the component's call, which does not
 * include a comment. The payload now only contains the sales record number.
 */
export async function rejectRequest(code: string): Promise<ApprovalResult> {
  const url = endpoints.actions.rejectRequest()
  const payload = { Code: code }

  const res = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_AUTHORIZATION,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`[rejectRequest] HTTP ${res.status}:`, text)
    throw new Error(`rejectRequest failed (${res.status}): ${text}`)
  }

  const result = (await res.json()) as ApprovalResult
  return result
}
