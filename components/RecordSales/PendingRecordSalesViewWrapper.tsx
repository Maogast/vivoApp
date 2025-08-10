// PendingRecordSalesViewWrapper.tsx
// This wrapper component is used to display a specific pending record sale.
// It takes a 'No' prop and renders the PendingRecordsSalesView component.
'use client' // This component is a Client Component

import React from 'react'
import PendingRecordsSalesView from './PendingRecordSalesView'
import { getUserFromClient } from '@/lib/get-user.client' // Updated import path

interface Props {
  No: string;
}

const PendingRecordSalesViewWrapper = ({ No }: Props) => {
  // Fetch user data on the client side
  const user = getUserFromClient();
  const username = user?.username || 'Unknown User'; // Get username, default if not found

  return (
    <div>
      <PendingRecordsSalesView No={No} username={username} />
    </div>
  )
}

export default PendingRecordSalesViewWrapper
