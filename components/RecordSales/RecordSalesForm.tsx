// components/RecordSales/RecordSalesForm.tsx
// This component displays and manages the sales records form.
// It supports adding, updating, deleting lines, sending for approval, and canceling the header.

'use client'

import React, { useEffect, useState, FormEvent, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { API_AUTHORIZATION, API_BASE_URL } from '@/lib/constants'

import { submitForApproval, deleteSalesHeader } from '@/lib/api'
import { useRouter } from 'next/navigation'

import type {
  VivoSalesHeader,
  VivoProduct,
  ProductSKU,
} from '@/types'

interface SalesLine {
  Officer_Code: any
  No: string
  SN: number // Sticking to user's provided type for SN
  Officer_Name: string
  Role_Name: string
  Product_Code?: string
  Target: number
  SKU_Code?: string
  SKU_Liters: number
  Grade: string
  Quantity: number
  Total: number
  SKU_Ratio: number
  Commission_Earned: number
  '@odata.etag': string
  isUpdating: boolean
}

type Toast = {
  type: 'success' | 'error'
  message: string
}

interface RecordSalesFormProps {
  No: string
  header: Pick<
    VivoSalesHeader,
    '@odata.etag' | 'Region_Name' | 'Region_Code' | 'Outlet_Name' | 'Outlet_Code'
  >
  onClose: () => void
  products: VivoProduct[]
  SKU: ProductSKU[]
}

export default function RecordSalesForm({
  No,
  header,
  onClose,
  products,
  SKU,
}: RecordSalesFormProps) {
  const router = useRouter()
  const [lineItems, setLineItems] = useState<SalesLine[]>([])
  const [toast, setToast] = useState<Toast | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  // ONLY ADDITION: New state to control the custom confirmation modal visibility
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Provide SKUs for the datalist
  const filteredSKUs = useMemo(() => SKU, [SKU])

  // Determine if there's at least one line with Quantity > 0
  const canApprove = useMemo(
    () => lineItems.some(item => item.Quantity > 0),
    [lineItems]
  )

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // Load existing sales lines when No changes
  useEffect(() => {
    if (!No) return
    fetch(`${API_BASE_URL}/NewSalesLines?$filter=No eq '${No}'`, {
      headers: { Authorization: API_AUTHORIZATION },
    })
      .then(r => r.json())
      .then(d =>
        setLineItems(
          (d.value || []).map((row: any) => ({ ...row, isUpdating: false }))
        )
      )
      .catch(console.error)
  }, [No])

  // Low‐level helper to PATCH a line
  async function patchLine(
    no: string,
    sn: number,
    payload: Partial<SalesLine>,
    etag: string
  ) {
    const url = `${API_BASE_URL}/NewSalesLines(No='${no}',SN=${sn})`
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: API_AUTHORIZATION,
        'If-Match': etag,
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`HTTP ${res.status}: ${txt}`)
    }
    return res.json()
  }

  // Generic per‐row updater
  async function handlePatch(
    idx: number,
    payload: Partial<SalesLine>,
    field: string
  ) {
    setLineItems(rows =>
      rows.map((r, i) => (i === idx ? { ...r, isUpdating: true } : r))
    )
    const row = lineItems[idx]

    try {
      const updated = await patchLine(
        row.No,
        row.SN,
        payload,
        row['@odata.etag']
      )
      setLineItems(rows =>
        rows.map((r, i) =>
          i === idx
            ? {
                ...r,
                ...updated,
                '@odata.etag': updated['@odata.etag'],
                isUpdating: false,
              }
            : r
        )
      )
      setToast({ type: 'success', message: `${field} updated` })
    } catch (err: any) {
      console.error(err)
      setLineItems(rows =>
        rows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      )
      setToast({ type: 'error', message: `Failed to update ${field}` })
    }
  }

  // Handlers for specific fields
  const handleProductChange = (i: number, code: string) =>
    handlePatch(i, { Product_Code: code }, 'Product')

  const handleQuantityChange = (i: number, qty: number) =>
    handlePatch(i, { Quantity: qty }, 'Quantity')

  const handleSKUChange = (idx: number, inputCode: string) => {
    if (inputCode === '') {
      handlePatch(idx, { SKU_Code: undefined }, 'SKU')
      return
    }
    const match = SKU.find(s => s.SKU_Code === inputCode)
    if (match) {
      handlePatch(idx, { SKU_Code: match.SKU_Code }, 'SKU')
    } else {
      console.warn(`Invalid SKU on line ${idx}: ${inputCode}`)
      handlePatch(idx, { SKU_Code: undefined }, 'SKU')
      setToast({
        type: 'error',
        message: `Invalid SKU '${inputCode}'. Please select from the list.`,
      })
    }
  }

  // Delete a line via DELETE
  async function handleDeleteLine(idx: number) {
    const item = lineItems[idx]
    if (!item) return

    setLineItems(rows =>
      rows.map((r, i) => (i === idx ? { ...r, isUpdating: true } : r))
    )
    const url = `${API_BASE_URL}/NewSalesLines(No='${item.No}',SN=${item.SN})`

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: API_AUTHORIZATION,
          'If-Match': item['@odata.etag'],
        },
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`HTTP ${res.status}: ${txt}`)
      }
      setLineItems(rows => rows.filter((_, i) => i !== idx))
      setToast({ type: 'success', message: 'Line deleted.' })
    } catch (err: any) {
      console.error(err)
      setLineItems(rows =>
        rows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      )
      setToast({ type: 'error', message: `Delete failed: ${err.message}` })
    }
  }

  // Add an empty line via POST
  async function handleAddEmptyLineAfter(idx: number) {
    const row = lineItems[idx]
    if (!row) return

    setLineItems(rows =>
      rows.map((r, i) => (i === idx ? { ...r, isUpdating: true } : r))
    )
    const payload = {
      No: row.No,
      Officer_Code: row.Officer_Code,
      Product_Code: row.Product_Code,
    }
    const url = `${API_BASE_URL}/NewSalesLines`

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: API_AUTHORIZATION,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`HTTP ${res.status}: ${txt}`)
      }
      const newLine = await res.json()
      setLineItems(rows => {
        const updated = [...rows]
        updated.splice(idx + 1, 0, { ...newLine, isUpdating: false })
        return updated.map((r, i) =>
          i === idx ? { ...r, isUpdating: false } : r
        )
      })
      setToast({ type: 'success', message: 'New line added.' })
    } catch (err: any) {
      console.error(err)
      setLineItems(rows =>
        rows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      )
      setToast({ type: 'error', message: `Add failed: ${err.message}` })
    }
  }

  // Prevent form submit on Enter
  const handleSubmit = (e: FormEvent) => e.preventDefault()

  // Send for Approval (guarded by canApprove)
  const handleSendForApproval = async () => {
    if (!canApprove) {
      setToast({
        type: 'error',
        message: 'Add at least one line with Qty > 0 before sending.',
      })
      return
    }

    setIsApproving(true)
    setToast(null)
    try {
      await submitForApproval(No)
      setToast({ type: 'success', message: 'Sent for approval' })
      setTimeout(onClose, 3000)
    } catch (err: any) {
      console.error(err)
      setToast({ type: 'error', message: err.message || 'Approval failed' })
    } finally {
      setIsApproving(false)
    }
  }

  // ONLY ADDITION: Handler to open the confirmation modal
  const handleInitiateCancel = () => {
    if (isApproving || isCancelling) return;
    setShowConfirmCancel(true); // Open the custom confirmation modal
  };

  // ONLY ADDITION: Handler for confirming deletion from the modal
  async function handleConfirmDeleteHeader() {
    setShowConfirmCancel(false); // Close the confirmation modal
    setIsCancelling(true);
    setToast(null);

    try {
      await deleteSalesHeader(No, header['@odata.etag']); 
      setToast({ type: 'success', message: 'Sale header cancelled' });

      setTimeout(() => {
        onClose();
        router.refresh(); 
      }, 1200);
    } catch (err: any) {
      console.error('Cancel failed:', err);
      setToast({ type: 'error', message: err.message || 'Cancel failed' });
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <Dialog open={!!No} onOpenChange={open => !open && onClose()}>
      {/* Toast / Banner */}
      {toast && (
        <div
          className={`
            fixed top-4 right-4 z-[99] p-4 rounded-lg shadow-lg flex items-center gap-2
            ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          `}
        >
          <Icon
            icon={
              toast.type === 'success'
                ? 'tabler:circle-check-filled'
                : 'tabler:circle-x-filled'
            }
            className="text-xl"
          />
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ONLY ADDITION: Custom Confirmation Modal for Cancel */}
      <Dialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel and delete sales record {No}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowConfirmCancel(false)} disabled={isCancelling}>
              No, Keep Sale
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteHeader} disabled={isCancelling}>
              {isCancelling ? 'Deleting...' : 'Yes, Delete Sale'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <DialogContent className="sm:max-w-8xl max-h-[98vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Sale No: {No}</DialogTitle>
            <DialogDescription>
              Fill in the SKU, quantity and review totals before send for approve or cancel.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-white border-b px-4 py-4 sticky top-[3.5rem] z-20 flex justify-between">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="uppercase">Sale No</Label>
                <Input readOnly defaultValue={No} className="mt-2" />
              </div>
              <div>
                <Label className="uppercase">Region</Label>
                <Input
                  readOnly
                  defaultValue={header.Region_Name}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="uppercase">Region Code</Label>
                <Input
                  readOnly
                  defaultValue={header.Region_Code}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="uppercase">Outlet</Label>
                <Input
                  readOnly
                  defaultValue={header.Outlet_Name}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="uppercase">Outlet Code</Label>
                <Input
                  readOnly
                  defaultValue={header.Outlet_Code}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                // ONLY CHANGE: Calls the new confirmation modal handler
                onClick={handleInitiateCancel} 
                disabled={isApproving || isCancelling}
              >
                {isCancelling ? 'Cancelling…' : 'Cancel'}
              </Button>
              <Button
                type="button"
                onClick={handleSendForApproval}
                disabled={!canApprove || isApproving || isCancelling}
              >
                {isApproving ? 'Sending…' : 'Send for Approval'}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-auto px-4 py-2">
            <Card className="bg-transparent p-4">
              <Table className="w-full">
                <TableCaption>Individual Sales Targets</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Target (Ltrs)</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>SKU (Ltrs)</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Total (Ltrs)</TableHead>
                    <TableHead>SKU Ratio</TableHead>
                    <TableHead>Commission Earned</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, idx) => (
                    <TableRow
                      key={`${item.No}-${item.SN}`}
                      className="even:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        {item.Officer_Name}
                      </TableCell>
                      <TableCell>{item.Role_Name}</TableCell>
                      <TableCell>
                        <select
                          className="w-full border rounded px-2 py-1"
                          disabled={item.isUpdating}
                          value={item.Product_Code ?? ''}
                          onChange={e =>
                            handleProductChange(idx, e.target.value)
                          }
                        >
                          <option value="">Select Product</option>
                          {products.map(p => (
                            <option key={p.Code} value={p.Code}>
                              {p.Description}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">{item.Target.toFixed(2)}</p>
                      </TableCell>
                      <TableCell>
                        <Input
                          list={`sku-options-${idx}`}
                          className="w-full border rounded px-2 py-1"
                          disabled={item.isUpdating}
                          value={item.SKU_Code ?? ''}
                          onChange={e => handleSKUChange(idx, e.target.value)}
                          placeholder="Search SKU"
                        />
                        <datalist id={`sku-options-${idx}`}>
                          {filteredSKUs.map(s => (
                            <option key={s.SKU_Code} value={s.SKU_Code}>
                              {s.SKU_Name}
                            </option>
                          ))}
                        </datalist>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">{item.SKU_Liters.toFixed(3)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">{item.Grade}</p>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-[80px] text-right"
                          disabled={item.isUpdating}
                          value={item.Quantity}
                          onChange={e =>
                            handleQuantityChange(idx, Number(e.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <p className="text-right">{item.Total.toFixed(3)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">
                          {item.SKU_Ratio.toFixed(3)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">
                          {item.Commission_Earned.toFixed(2)}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.isUpdating ? (
                          <Icon
                            icon="solar:spinner-loop-bold"
                            className="animate-spin text-xl"
                          />
                        ) : (
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddEmptyLineAfter(idx)}
                              disabled={isApproving || isCancelling}
                            >
                              +
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteLine(idx)}
                              disabled={isApproving || isCancelling}
                            >
                              ×
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  )
}
