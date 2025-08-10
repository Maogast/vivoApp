// app/dashboard/pending-sales/page.tsx
// This file is part of the Vivo Sales Dashboard application.
// It fetches and displays pending sales records for the logged-in user.
import React from 'react'
import { redirect } from 'next/navigation'
import { getUserFromServer } from '@/lib/get-user.server' // Updated import path
import { fetchData } from '@/lib/api'
import { API_BASE_URL } from '@/lib/constants'
import PendingSalesList from '@/components/PendingSales/PendingSalesList'
import type { VivoSalesHeader } from '@/types'

const page = async () => {
  // 1) Grab the logged-in user from the server-side function
  const user = await getUserFromServer()

  // 2) If there's no session, kick them to login
  if (!user) {
    redirect('/login')
  }

  // 3) Fetch pending sales filtered by region & outlet
  const { value: pending = [] } = await fetchData<{ value: VivoSalesHeader[] }>(
    `${API_BASE_URL}/NewPendingSalesList2` +
      `?$filter=Region_Code eq '${encodeURIComponent(user.region_code)}'` +
      ` and Outlet_Code eq '${encodeURIComponent(user.outlet_code)}'`
  )

  // 4) Render your list
  return <PendingSalesList data={pending} />
}

export default page
