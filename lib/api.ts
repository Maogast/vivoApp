import { API_AUTHORIZATION } from './constants'
import { endpoints } from './endpoints'
import {
  SalesLine,
  VivoProduct,
  ProductSKU,
  NewApprovedSalesRecord,
  VivoSalesHeader,
  ApprovalResult,
  VivoSalesLine as RawVivoSalesLine, // Import original VivoSalesLine as RawVivoSalesLine
} from '@/types'; // Import all types from the central types file


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
  const res = await fetchData<{ value: RawVivoSalesLine[] }>(url); // Expect RawVivoSalesLine[] from API
  return res.value.map(row => ({
    No: row.No,
    SN: row.Line_No, // Map Line_No to SN
    SKU_Code: row.SKU_Code,
    SKU_Liters: row.Litres_Sold, // Map Litres_Sold to SKU_Liters
    Commission_Earned: row.Commission_Earned,
    '@odata.etag': row['@odata.etag'],
    SKU_Name: row.SKU_Name || '', // Map SKU_Name, provide default
    Grade: row.Grade || '', // Map Grade, provide default
    Quantity: row.Quantity || 0, // Map Quantity, provide default
    Total: row.Total || 0, // Map Total, provide default
    SKU_Ratio: row.SKU_Ratio || 0, // Map SKU_Ratio, provide default
    // Provide default or derived values for properties not in RawVivoSalesLine
    Officer_Name: '',
    Role_Name: '',
    Product_Code: '',
    Target: 0,
    isUpdating: false
  }));
}

/**
 * Adds a new sales line to a sale.
 * @param saleNo The sale number to which the new line will be added.
 * @returns The newly created sales line object from the API.
 */
export async function addSalesLine(saleNo: string): Promise<SalesLine> {
  const url = endpoints.recordSales.newSalesLines();
  // Construct payload for API based on RawVivoSalesLine structure
  const payload: Partial<RawVivoSalesLine> = { No: saleNo }; // Only No is needed for adding a new line
  const newLine = await createData<typeof payload, RawVivoSalesLine>(url, payload); // Expect RawVivoSalesLine from API
  return {
    No: newLine.No,
    SN: newLine.Line_No,
    SKU_Code: newLine.SKU_Code,
    SKU_Liters: newLine.Litres_Sold,
    Commission_Earned: newLine.Commission_Earned,
    '@odata.etag': newLine['@odata.etag'],
    SKU_Name: newLine.SKU_Name || '',
    Grade: newLine.Grade || '',
    Quantity: newLine.Quantity || 0,
    Total: newLine.Total || 0,
    SKU_Ratio: newLine.SKU_Ratio || 0,
    // Provide default or derived values for properties not in RawVivoSalesLine
    Officer_Name: '',
    Role_Name: '',
    Product_Code: '',
    Target: 0,
    isUpdating: false
  };
}

/**
 * Updates a specific sales line item.
 * @param saleNo The sale number.
 * @param sn The serial number of the line item.
 * @param payload The fields to update (from SalesLine).
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
  // Map payload from SalesLine (component type) to RawVivoSalesLine (API type)
  const apiPayload: Partial<RawVivoSalesLine> = {
    No: payload.No,
    Line_No: payload.SN,
    SKU_Code: payload.SKU_Code,
    Litres_Sold: payload.SKU_Liters, // Map SKU_Liters back to Litres_Sold for API
    Grade: payload.Grade,
    Commission_Earned: payload.Commission_Earned,
    SKU_Name: payload.SKU_Name,
    Quantity: payload.Quantity,
    Total: payload.Total,
    SKU_Ratio: payload.SKU_Ratio,
  };
  const updatedLine = await updateData<Partial<RawVivoSalesLine>, RawVivoSalesLine>(url, apiPayload, {
    headers: { 'If-Match': etag },
  });
  return {
    No: updatedLine.No,
    SN: updatedLine.Line_No,
    SKU_Code: updatedLine.SKU_Code,
    SKU_Liters: updatedLine.Litres_Sold,
    Commission_Earned: updatedLine.Commission_Earned,
    '@odata.etag': updatedLine['@odata.etag'],
    SKU_Name: updatedLine.SKU_Name || '',
    Grade: updatedLine.Grade || '',
    Quantity: updatedLine.Quantity || 0,
    Total: updatedLine.Total || 0,
    SKU_Ratio: updatedLine.SKU_Ratio || 0,
    // Provide default or derived values for properties not in RawVivoSalesLine
    Officer_Name: payload.Officer_Name || '', // Retain existing if not updated by API
    Role_Name: payload.Role_Name || '',
    Product_Code: payload.Product_Code || '',
    Target: payload.Target || 0,
    isUpdating: false
  };
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
    Sales_Date: item.Sale_Date, // Correctly map Sale_Date from NewApprovedSalesRecord to Sales_Date in VivoSalesHeader
    Region_Code: item.Region_Code,
    Region_Name: item.Region_Name,
    Outlet_Code: item.Outlet_Code,
    Outlet_Name: item.Outlet_Name,
    Total_Target: item.Total_Target,
    Total_Achieved: item.Total_Target, // Achieved is not in the API response, so we mirror Target
    Total_Commission_Earned: item.Total_Commission_Earned,
    Status: item.Status,
    Captured_By: '', // Added missing Captured_By property
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
