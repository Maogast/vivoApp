// components/RecordSales/actions.ts
// This file contains server-side actions related to sales headers.
// It includes functionality to create a new sales header and handle form submissions.
'use server'

import { createData } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";

export async function createSalesHeader(initialSate: any, formData: FormData) {
    try {
      const payload = {
        "@odata.etag": formData.get("@odata.etag"),
        Region_Code: formData.get("Region_Code"),
        Outlet_Code: formData.get("Outlet_Code"),
      };
       
       console.log("PAYLOAD", payload)

       const res = await createData(`${API_BASE_URL}/NewSalesHeader`, payload);
       console.log("RESPONSE: ", res)
       
       if (!res.ok) {
           console.log("SErver error", res.status)
       }

      const data = res
      console.log("DATA: ", data)
       return {
          success: true,
          data
       };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
}