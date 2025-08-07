// components/RecordSales/CreateNewHeaderCopy.tsx
// This component allows users to create a new sales header.
// It uses a dialog to collect necessary information and submits it to the server.
'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { Button } from '../ui/button'
import { createSalesHeader } from './actions'
import { useRouter } from 'next/navigation'
import RecordSalesForm from './RecordSalesForm'
import type { VivoSalesHeader, VivoUserSessionDetails, VivoProduct, ProductSKU } from '@/types'
import { API_BASE_URL, API_AUTHORIZATION } from '@/lib/constants' // Import API_BASE_URL and API_AUTHORIZATION
import { Icon } from '@iconify/react/dist/iconify.js' // Import Icon for loading spinner

/**
 * Minimum header fields needed both to create a new header
 * and to pass into RecordSalesForm afterward.
 */
type NewHeaderFields = Pick<
  VivoSalesHeader,
  '@odata.etag' | 'Region_Code' | 'Outlet_Code' | 'Region_Name' | 'Outlet_Name'
>

type Toast = {
  type: 'success' | 'error'
  message: string
}

export default function CreateNewHeaderCopy() {
  const [isPending, startTransition] = useTransition()
  const [actionState, formAction] = React.useActionState(createSalesHeader, null)
  const router = useRouter()

  // holds the brand-new header once created
  const [createdHeader, setCreatedHeader] = useState<VivoSalesHeader | null>(
    null
  )

  // initial form values come from the stored session
  const [formData, setFormData] = useState<NewHeaderFields>({
    '@odata.etag': '',
    Region_Code: '',
    Outlet_Code: '',
    Region_Name: '',
    Outlet_Name: '',
  })

  // State for products and SKUs, now fetched here
  const [products, setProducts] = useState<VivoProduct[]>([])
  const [SKU, setSKU] = useState<ProductSKU[]>([])
  const [isLoadingLookups, setIsLoadingLookups] = useState(true); // Loading state for lookup data
  const [toast, setToast] = useState<Toast | null>(null) // Toast for this component

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  // Hydrate from localStorage (your VivoUserSessionDetails shape)
  useEffect(() => {
    const stored = localStorage.getItem('vivoUser')
    if (!stored) return

    try {
      const vivoUser = JSON.parse(stored) as VivoUserSessionDetails

      setFormData({
        '@odata.etag': vivoUser['@odata.etag'] || '',
        Region_Code: vivoUser.region_code,
        Outlet_Code: vivoUser.outlet_code,
        Region_Name: vivoUser.region,
        Outlet_Name: vivoUser.outlet,
      })
    } catch (err) {
      console.error('Error parsing vivoUser:', err)
      setToast({ type: 'error', message: 'Failed to load user data.' });
    }
  }, [])

  // Load lookup data (products and SKUs) once when CreateNewHeaderCopy mounts
  useEffect(() => {
    const fetchLookups = async () => {
      setIsLoadingLookups(true);
      try {
        // Fetch products
        const productsRes = await fetch(`${API_BASE_URL}/vivoproducts`, {
          headers: { Authorization: API_AUTHORIZATION },
        });
        const productsData = await productsRes.json();
        setProducts(productsData.value || []);

        // Fetch SKUs
        const skuRes = await fetch(`${API_BASE_URL}/LubricantSKUs`, {
          headers: { Authorization: API_AUTHORIZATION },
        });
        const skuData = await skuRes.json();
        setSKU(skuData.value || []);

      } catch (error) {
        console.error('Failed to fetch lookup data:', error);
        setToast({ type: 'error', message: 'Failed to load product/SKU data.' });
      } finally {
        setIsLoadingLookups(false);
      }
    };

    fetchLookups();
  }, []); // Empty dependency array means this runs once on mount

  // when the action completes successfully, cache the new header
  useEffect(() => {
    if (actionState?.success && actionState.data) {
      setCreatedHeader(actionState.data as VivoSalesHeader)
      router.refresh()
      setToast({ type: 'success', message: `Sale header created: ${actionState.data.No}` });
    } else if (actionState?.error) {
      setToast({ type: 'error', message: actionState.error });
    }
  }, [actionState, router])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoadingLookups) {
      setToast({ type: 'error', message: 'Product and SKU data is still loading. Please wait.' });
      return;
    }
    startTransition(() => {
      formAction(new FormData(e.currentTarget))
    })
  }

  return (
    <>
      {/* Toast / Confirmation Banner */}
      {toast && (
        <div
          className={`mb-4 p-3 rounded border text-sm ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {toast.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 mt-4"
      >
        {/* hidden inputs for the unbound createSalesHeader action */}
        <input
          type="hidden"
          name="@odata.etag"
          value={formData['@odata.etag']}
        />
        <input
          type="hidden"
          name="Region_Code"
          value={formData.Region_Code}
        />
        <input
          type="hidden"
          name="Outlet_Code"
          value={formData.Outlet_Code}
        />

        <Button type="submit" disabled={isPending || isLoadingLookups}>
          {isPending ? 'Submitting...' : isLoadingLookups ? (
            <>
              <Icon
                icon="solar:spinner-loop-bold"
                className="animate-spin text-xl mr-2"
              />
              Loading Data...
            </>
          ) : 'Add New Sale'}
        </Button>
      </form>

      {/* once created, open the RecordSalesForm with the new header */}
      {createdHeader && (
        <RecordSalesForm
          header={createdHeader}
          No={createdHeader.No}
          onClose={() => setCreatedHeader(null)}
          products={products} // Pass products to RecordSalesForm
          SKU={SKU}           // Pass SKU to RecordSalesForm
        />
      )}
    </>
  )
}
