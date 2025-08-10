import { API_BASE_URL } from './constants'

/**
 * All API endpoints used in the application.
 * The endpoints are grouped logically for better maintainability.
 */
export const endpoints = {
  /**
   * 1. Sales data filtered by region & outlet
   */
  getSalesDataOutlet: (regionCode: string, outletCode: string) =>
    `${API_BASE_URL}/VivoSalesData`
    + `?$filter=Region_Code eq '${encodeURIComponent(regionCode)}'`
    + ` and Outlet_Code eq '${encodeURIComponent(outletCode)}'`,

  /**
   * 2. Unbound OData actions
   */
  actions: {
    sendRequestForApproval: () => `${API_BASE_URL}/SendRequestForApproval`,
    returnBackToOpen: () => `${API_BASE_URL}/ReturnBackToOpen`,
    approveRequest: () => `${API_BASE_URL}/ApproveRequest`,
    rejectRequest: () => `${API_BASE_URL}/RejectRequest`,
  },

  /**
   * 3. Endpoints related to Record Sales (Pending Sales View)
   */
  recordSales: {
    /**
     * Pending‐sales list (OData view NewPendingSalesList2)
     * Optionally filtered by region & outlet
     */
    pendingSalesList: (regionCode?: string, outletCode?: string) => {
      let url = `${API_BASE_URL}/NewPendingSalesList2`
      if (regionCode && outletCode) {
        url += `?$filter=Region_Code eq '${encodeURIComponent(regionCode)}'`
             + ` and Outlet_Code eq '${encodeURIComponent(outletCode)}'`
      }
      return url
    },

    /**
     * Single‐sale header details by sale No (HeaderDetails)
     */
    headerDetails: (saleNo?: string) => {
      let url = `${API_BASE_URL}/HeaderDetails`
      if (saleNo) {
        url += `?$filter=No eq '${encodeURIComponent(saleNo)}'`
      }
      return url
    },

    /**
     * Inline line items for a sale (NewSalesLines)
     * This endpoint now also supports POST to add a new line.
     */
    newSalesLines: (saleNo?: string) => {
      let url = `${API_BASE_URL}/NewSalesLines`
      if (saleNo) {
        url += `?$filter=No eq '${encodeURIComponent(saleNo)}'`
      }
      return url
    },
    
    // NEW: Endpoint to address a specific sales line item for PATCH and DELETE operations.
    salesLineItem: (saleNo: string, sn: number) => 
      `${API_BASE_URL}/NewSalesLines(No='${encodeURIComponent(saleNo)}',SN=${sn})`,
  },
  
  // NEW: Lookup data endpoints.
  lookup: {
    /**
     * Retrieves the list of all Vivo products.
     */
    vivoProducts: () => `${API_BASE_URL}/vivoproducts`,
    
    /**
     * Retrieves the list of all Lubricant SKUs.
     */
    lubricantSKUs: () => `${API_BASE_URL}/LubricantSKUs`,

    /**
     * Approved Sales (OData view NewApprovedSalesList2).
     * Filtered by region & outlet codes.
     */
    newApprovedSalesList: (regionCode: string, outletCode: string) =>
      `${API_BASE_URL}/NewApprovedSalesList2`
      + `?$filter=Region_Code eq '${encodeURIComponent(regionCode)}'`
      + ` and Outlet_Code eq '${encodeURIComponent(outletCode)}'`,
  },
}
