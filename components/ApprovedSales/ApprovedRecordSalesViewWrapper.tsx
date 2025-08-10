'use client'

import React from 'react'
import ApprovedRecordsSalesView from './ApprovedRecordsSalesView' // Import the new detailed view component
import { Button } from '@/components/ui/button' // Import Button from your UI library
import { Dialog, DialogTrigger } from '@/components/ui/dialog' // Import Dialog and DialogTrigger

interface Props {
  No: string;
  username: string; // Prop to pass the captured by username
}

const ApprovedRecordSalesViewWrapper = ({ No, username }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* The button that acts as the hyperlink */}
        <Button variant="link" className="p-0 h-auto">
          {No}
        </Button>
      </DialogTrigger>
      {/* The actual content of the dialog will be rendered by ApprovedRecordsSalesView */}
      <ApprovedRecordsSalesView No={No} username={username} />
    </Dialog>
  )
}

export default ApprovedRecordSalesViewWrapper
