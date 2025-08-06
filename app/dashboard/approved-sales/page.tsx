import React from 'react'
import { redirect } from 'next/navigation'
import { getUserFromServer } from '@/lib/get-user.server' // Updated import path
import { fetchNewApprovedSalesList } from '@/lib/api'
import { ApprovedSalesList } from '@/components/ApprovedSales/ApprovedSalesList'
import { VivoSalesHeader } from '@/types' // Import VivoSalesHeader from the central types file

export default async function ApprovedSalePage() {
  // 1) Grab the logged-in user from the server-side function
  const user = await getUserFromServer()

  // 2) If there's no session, kick them to login
  if (!user) {
    redirect('/login')
  }

  // 3) Fetch approved sales filtered by region & outlet
  // fetchNewApprovedSalesList now directly returns VivoSalesHeader[]
  const approved: VivoSalesHeader[] = await fetchNewApprovedSalesList(
    user.region_code,
    user.outlet_code,
  )

  // 4) Render the list, passing the username
  return (
    <div className="flex flex-col h-full w-full p-4">
      <div className="mt-4 flex-1">
        <ApprovedSalesList data={approved} username={user.username} />
      </div>
    </div>
  )
}
