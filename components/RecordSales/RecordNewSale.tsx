// components/RecordSales/RecordNewSale.tsx
'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../ui/button'
import { createSalesHeader } from './actions'
import RecordSalesForm from './RecordSalesForm'

import type {
  VivoSalesHeader,
  VivoProduct,
  ProductSKU,
  VivoUserSessionDetails,
} from '@/types'
import { API_BASE_URL, API_AUTHORIZATION } from '@/lib/constants'

export default function RecordNewSale() {
  const [isPending, startTransition] = useTransition()
  const [actionState, formAction] = React.useActionState(createSalesHeader, null)
  const router = useRouter()

  // after creation this holds the full header with @odata.etag
  const [createdHeader, setCreatedHeader] = useState<VivoSalesHeader | null>(null)

  // lookup data
  const [products, setProducts] = useState<VivoProduct[]>([])
  const [SKU, setSKU] = useState<ProductSKU[]>([])
  const [isLoadingLookups, setIsLoadingLookups] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // load user data & lookups similarly to your original…

  // watch your server action
  useEffect(() => {
    if (actionState?.success && actionState.data) {
      const header = actionState.data as VivoSalesHeader
      setCreatedHeader(header)
      router.refresh()
      setToast(`Sale header created: ${header.No}`)
    } else if (actionState?.error) {
      setToast(`Error creating header: ${actionState.error}`)
    }
  }, [actionState, router])

  // if no header yet, show your “create header” form
  if (!createdHeader) {
    return (
      <form onSubmit={(e) => {
        e.preventDefault()
        if (isLoadingLookups) {
          setToast('Please wait until products & SKUs load.')
          return
        }
        startTransition(() => formAction(new FormData(e.currentTarget)))
      }}>
        {/* your inputs for region/outlet (hiddden or select)… */}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating…' : 'Create New Sale'}
        </Button>
      </form>
    )
  }

  // once createdHeader exists, render the RecordSalesForm
  return (
    <>
      {toast && <div className="mb-4 p-3 bg-green-50">{toast}</div>}

      <RecordSalesForm
        No={createdHeader.No}

        // ← **THIS** must match the Pick<> in RecordSalesForm
        header={{
          '@odata.etag': createdHeader['@odata.etag'],
          Region_Name:   createdHeader.Region_Name,
          Region_Code:   createdHeader.Region_Code,
          Outlet_Name:   createdHeader.Outlet_Name,
          Outlet_Code:   createdHeader.Outlet_Code,
        }}

        onClose={() => {
          // reset back to the create‐form or close your dialog
          setCreatedHeader(null)
        }}

        products={products}
        SKU={SKU}
      />
    </>
  )
}
