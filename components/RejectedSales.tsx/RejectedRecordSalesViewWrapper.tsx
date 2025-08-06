'use client'

import React from 'react'
import RejectedRecordsSalesView from './RejectedRecordsSalesView'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'

const RejectedRecordSalesViewWrapper = ({ No, username }: { No: string; username: string }) => { // Added username prop
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto">
          {No}
        </Button>
      </DialogTrigger>
      {/* Pass username to RejectedRecordsSalesView */}
      <RejectedRecordsSalesView No={No} username={username} />
    </Dialog>
  )
}

export default RejectedRecordSalesViewWrapper
