// app/dashboard/Reject-page.tsx

import { RejectedSalesList } from '@/components/RejectedSales.tsx/RejectedSales';
import { fetchData } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { getUserData } from '@/lib/get-user';
import { VivoSalesHeader } from '@/types'; // Assuming VivoSalesHeader is in '@/types'
import React from 'react';
import { redirect } from 'next/navigation'; // Import redirect

const page = async () => {
   const user = await getUserData();

   if (!user) {
     redirect('/login'); // Redirect if no user
   }

   const rejectedSales = await fetchData(
     `${API_BASE_URL}/NewRejectList?$filter=Region_Code eq '${user?.region_code}' and Outlet_Code eq '${user?.outlet_code}'`,
   );

   const rejected: VivoSalesHeader[] = rejectedSales?.value || [];
   return (
     <>
        {/* Pass the username to RejectedSalesList */}
        <RejectedSalesList data={rejected} username={user.username} />
     </>
   );
};

export default page;
