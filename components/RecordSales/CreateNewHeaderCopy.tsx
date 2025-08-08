// components/RecordSales/CreateNewHeaderCopy.tsx
// This component allows users to create a new sales header.
// It uses a Radix Dialog to confirm before submitting and then renders the RecordSalesForm.
'use client'

import React, {
  useEffect,
  useState,
  useTransition,
  useRef,
} from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../ui/button'
import { createSalesHeader } from './actions'
import { useRouter } from 'next/navigation'
import RecordSalesForm from './RecordSalesForm'
import type {
  VivoSalesHeader,
  VivoUserSessionDetails,
  VivoProduct,
  ProductSKU,
} from '@/types'
import { API_BASE_URL, API_AUTHORIZATION } from '@/lib/constants'
import { Icon } from '@iconify/react/dist/iconify.js'

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
  const [actionState, formAction] = React.useActionState(
    createSalesHeader,
    null
  )
  const router = useRouter()

  // local refs & state for confirmation dialog
  const [showConfirm, setShowConfirm] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // holds the brand-new header once created
  const [createdHeader, setCreatedHeader] =
    useState<VivoSalesHeader | null>(null)

  // initial form values come from the stored session
  const [formData, setFormData] = useState<NewHeaderFields>({
    '@odata.etag': '',
    Region_Code: '',
    Outlet_Code: '',
    Region_Name: '',
    Outlet_Name: '',
  })

  // lookup data
  const [products, setProducts] = useState<VivoProduct[]>([])
  const [SKU, setSKU] = useState<ProductSKU[]>([])
  const [isLoadingLookups, setIsLoadingLookups] = useState(true)
  const [toast, setToast] = useState<Toast | null>(null)

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('vivoUser')
    if (!stored) return

    try {
      const vivoUser = JSON.parse(
        stored
      ) as VivoUserSessionDetails

      setFormData({
        '@odata.etag': vivoUser['@odata.etag'] || '',
        Region_Code: vivoUser.region_code,
        Outlet_Code: vivoUser.outlet_code,
        Region_Name: vivoUser.region,
        Outlet_Name: vivoUser.outlet,
      })
    } catch (err) {
      console.error('Error parsing vivoUser:', err)
      setToast({
        type: 'error',
        message: 'Failed to load user data.',
      })
    }
  }, [])

  // Load lookup data
  useEffect(() => {
    const fetchLookups = async () => {
      setIsLoadingLookups(true)
      try {
        const productsRes = await fetch(
          `${API_BASE_URL}/vivoproducts`,
          { headers: { Authorization: API_AUTHORIZATION } }
        )
        const productsData = await productsRes.json()
        setProducts(productsData.value || [])

        const skuRes = await fetch(
          `${API_BASE_URL}/LubricantSKUs`,
          { headers: { Authorization: API_AUTHORIZATION } }
        )
        const skuData = await skuRes.json()
        setSKU(skuData.value || [])
      } catch (error) {
        console.error('Failed to fetch lookups:', error)
        setToast({
          type: 'error',
          message: 'Failed to load product/SKU data.',
        })
      } finally {
        setIsLoadingLookups(false)
      }
    }

    fetchLookups()
  }, [])

  // Handle server action result
  useEffect(() => {
    if (actionState?.success && actionState.data) {
      setCreatedHeader(actionState.data as VivoSalesHeader)
      router.refresh()
      setToast({
        type: 'success',
        message: `Sale header created: ${actionState.data.No}`,
      })
    } else if (actionState?.error) {
      setToast({ type: 'error', message: actionState.error })
    }
  }, [actionState, router])

  /** main submit handler */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isLoadingLookups) {
      setToast({
        type: 'error',
        message:
          'Product and SKU data is still loading. Please wait.',
      })
      return
    }

    startTransition(() => {
      formAction(new FormData(e.currentTarget))
    })
  }

  /** when user clicks confirm in dialog */
  const handleConfirm = () => {
    setShowConfirm(false)
    formRef.current?.dispatchEvent(
      new Event('submit', {
        bubbles: true,
        cancelable: true,
      })
    )
  }

  return (
    <>
      {/* Toast / Banner */}
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

      {/* Confirmation Dialog + Form */}
      <Dialog.Root
        open={showConfirm}
        onOpenChange={setShowConfirm}
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mt-4"
        >
          {/* hidden inputs */}
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

          <Dialog.Trigger asChild>
            <Button
              type="button"
              disabled={isPending || isLoadingLookups}
            >
              {isPending
                ? 'Submitting...'
                : isLoadingLookups ? (
                    <>
                      <Icon
                        icon="solar:spinner-loop-bold"
                        className="animate-spin text-xl mr-2"
                      />
                      Loading Data...
                    </>
                  ) : (
                    'Add New Sale'
                  )}
            </Button>
          </Dialog.Trigger>
        </form>

        {/* Radix Confirmation Modal */}
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />

          <Dialog.Content className="fixed top-1/2 left-1/2 w-96 p-6 bg-white shadow-lg -translate-x-1/2 -translate-y-1/2 rounded">
            <Dialog.Title className="text-lg font-semibold">
              Confirm New Sale
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-600">
              Are you sure you want to create a new sale header? You’ll
              be taken to the record-sales form next.
            </Dialog.Description>

            <div className="mt-4 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
              </Dialog.Close>

              <Button onClick={handleConfirm}>Confirm</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* once created, open the RecordSalesForm with the new header */}
      {createdHeader && (
        <RecordSalesForm
          header={createdHeader}
          No={createdHeader.No}
          onClose={() => setCreatedHeader(null)}
          products={products}
          SKU={SKU}
        />
      )}
    </>
  )
}
