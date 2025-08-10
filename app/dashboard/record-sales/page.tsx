// app/dashboard/record-sales/page.tsx
// This file is part of the Vivo Sales Dashboard application.
// It fetches and displays open sales records for the logged-in user.

import { RecordSalesList } from '@/components/RecordSales/RecordSalesList';
import { fetchData } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { getUserData } from '@/lib/get-user';
import { OpenSale, VivoSalesHeader } from '@/types';
import React from 'react';

const page = async () => {
  const user = await getUserData();
  const openSales = await fetchData(
    `${API_BASE_URL}/NewOpenSalesList_2?$filter=Region_Code eq '${user?.region_code}' and Outlet_Code eq '${user?.outlet_code}'`,
  );

  const openSalesData: VivoSalesHeader[] = openSales?.value || [];
  return (
    <>
      <RecordSalesList data={openSalesData} />
    </>
  );
};

export default page;
