'use server'

import { cookies } from 'next/headers'
import { API_BASE_URL } from './constants'
import { endpoints } from './endpoints' // Assuming endpoints is imported from './endpoints'
// Ensure these types are correctly defined in your '@/types' file
import { VivoSalesHeader, SalesLine, VivoProduct, ProductSKU } from '@/types' 

// Helper for API calls
async function apiCall<T>(url: string, method: string, token: string, body?: any, etag?: string): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        };

        if (etag) {
            headers['If-Match'] = etag; // For PATCH/DELETE operations
        }

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            cache: 'no-store' // Ensure fresh data
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error (${method} ${url}): ${response.status} - ${errorText}`);
            throw new Error(`API Error: ${response.statusText} - ${errorText}`);
        }

        // Handle cases where API might return 204 No Content for DELETE/PUT
        if (response.status === 204) {
            return { success: true, data: {} as T }; // Return an empty object for 204
        }

        const data: T = await response.json();
        return { success: true, data };
    } catch (error: any) {
        console.error(`API call failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Helper to get user session details
async function getUserSessionDetails(): Promise<{ success: boolean; data?: { username: string; token: string }; error?: string }> {
    // *** FIX: Await cookies() call ***
    const cookieStore = await cookies(); 
    const username = cookieStore.get('username')?.value;
    const token = cookieStore.get('access_token')?.value;

    if (!username || !token) {
        return { success: false, error: 'Authentication required. Username or token not found.' };
    }
    return { success: true, data: { username, token } };
}

/**
 * Placeholder function for creating a new sales header.
 * You'll need to implement the actual logic for this.
 */
export async function createSalesHeader(payload: any): Promise<{ success: boolean; data?: VivoSalesHeader; error?: string }> {
    try {
        const sessionResult = await getUserSessionDetails();
        if (!sessionResult.success || !sessionResult.data) {
            return { success: false, error: sessionResult.error || 'Authentication required.' };
        }
        const { token } = sessionResult.data;

        // *** IMPORTANT: Replace with your actual endpoint for creating a sales header ***
        // Example: If you have an endpoint like `${API_BASE_URL}/SalesHeaders` for POST
        const url = `${API_BASE_URL}/SalesHeaders`; 

        const result = await apiCall<VivoSalesHeader>(url, 'POST', token, payload);

        if (result.success && result.data) {
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.error || 'Failed to create sales header.' };
        }
    } catch (error: any) {
        console.error("Error creating sales header:", error);
        return { success: false, error: error.message || 'Failed to create sales header.' };
    }
}


/**
 * Fetches sales headers for the authenticated user.
 * This function now correctly uses the `endpoints.recordSales.headerDetails` endpoint.
 */
export async function getSalesHeaders(): Promise<{ success: boolean; data?: VivoSalesHeader[]; error?: string }> {
    try {
        const sessionResult = await getUserSessionDetails();
        if (!sessionResult.success || !sessionResult.data) {
            return { success: false, error: sessionResult.error || 'Authentication required.' };
        }
        const { username, token } = sessionResult.data;

        // Using endpoints.recordSales.headerDetails() and applying filter
        const url = `${endpoints.recordSales.headerDetails()}?$filter=User_ID eq '${encodeURIComponent(username)}'`;

        const result = await apiCall<VivoSalesHeader[]>(url, 'GET', token);

        if (result.success && result.data) {
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.error || 'Failed to fetch sales headers.' };
        }
    } catch (error: any) {
        console.error("Error fetching sales headers:", error);
        return { success: false, error: error.message || 'Failed to fetch sales headers.' };
    }
}

/**
 * Fetches sales lines for a given sale number.
 */
export async function fetchSalesLines(saleNo: string): Promise<SalesLine[]> {
    const sessionResult = await getUserSessionDetails();
    if (!sessionResult.success || !sessionResult.data) {
        throw new Error(sessionResult.error || 'Authentication required.');
    }
    const { token } = sessionResult.data;

    const url = endpoints.recordSales.newSalesLines(saleNo);
    const result = await apiCall<SalesLine[]>(url, 'GET', token);
    if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch sales lines.');
    }
    return result.data;
}

/**
 * Updates a specific sales line item.
 */
export async function updateSalesLine(saleNo: string, sn: number, payload: Partial<SalesLine>, etag: string): Promise<SalesLine> {
    const sessionResult = await getUserSessionDetails();
    if (!sessionResult.success || !sessionResult.data) {
        throw new Error(sessionResult.error || 'Authentication required.');
    }
    const { token } = sessionResult.data;

    const url = endpoints.recordSales.salesLineItem(saleNo, sn);
    const result = await apiCall<SalesLine>(url, 'PATCH', token, payload, etag);
    if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update sales line.');
    }
    return result.data;
}

/**
 * Deletes a specific sales line item.
 */
export async function deleteSalesLine(saleNo: string, sn: number, etag: string): Promise<{ success: boolean; error?: string }> {
    const sessionResult = await getUserSessionDetails();
    if (!sessionResult.success || !sessionResult.data) {
        return { success: false, error: sessionResult.error || 'Authentication required.' };
    }
    const { token } = sessionResult.data;

    const url = endpoints.recordSales.salesLineItem(saleNo, sn);
    const result = await apiCall<void>(url, 'DELETE', token, undefined, etag);
    // *** FIX: Changed return type to be consistent with apiCall result ***
    return { success: result.success, error: result.error }; 
}

/**
 * Adds a new sales line to a sales header.
 */
export async function addSalesLine(saleNo: string): Promise<SalesLine> {
    const sessionResult = await getUserSessionDetails();
    if (!sessionResult.success || !sessionResult.data) {
        throw new Error(sessionResult.error || 'Authentication required.');
    }
    const { token } = sessionResult.data;

    // When adding a new line, we POST to the collection endpoint
    const url = endpoints.recordSales.newSalesLines(); // No saleNo in the URL for POST
    const payload = { No: saleNo }; // The saleNo is part of the payload for a new line

    const result = await apiCall<SalesLine>(url, 'POST', token, payload);
    if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to add sales line.');
    }
    return result.data;
}

/**
 * Submits a sales header for approval.
 */
export async function submitForApproval(saleNo: string): Promise<void> {
    const sessionResult = await getUserSessionDetails();
    if (!sessionResult.success || !sessionResult.data) {
        throw new Error(sessionResult.error || 'Authentication required.');
    }
    const { token } = sessionResult.data;

    const url = endpoints.actions.sendRequestForApproval();
    const payload = { salesNo: saleNo }; // Assuming the API expects 'salesNo' in the payload

    const result = await apiCall<void>(url, 'POST', token, payload);
    if (!result.success) {
        throw new Error(result.error || 'Failed to send for approval.');
    }
}

/**
 * Fetches Vivo products for lookup.
 */
export async function fetchVivoProducts(): Promise<VivoProduct[]> {
    const sessionResult = await getUserSessionDetails();
    if (!sessionResult.success || !sessionResult.data) {
        throw new Error(sessionResult.error || 'Authentication required.');
    }
    const { token } = sessionResult.data;

    const url = endpoints.lookup.vivoProducts();
    const result = await apiCall<VivoProduct[]>(url, 'GET', token);
    if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch Vivo products.');
    }
    return result.data;
}

/**
 * Fetches Lubricant SKUs for lookup.
 */
export async function fetchLubricantSKUs(): Promise<ProductSKU[]> {
    const sessionResult = await getUserSessionDetails();
    if (!sessionResult.success || !sessionResult.data) {
        throw new Error(sessionResult.error || 'Authentication required.');
    }
    const { token } = sessionResult.data;

    const url = endpoints.lookup.lubricantSKUs();
    const result = await apiCall<ProductSKU[]>(url, 'GET', token);
    if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch Lubricant SKUs.');
    }
    return result.data;
}
