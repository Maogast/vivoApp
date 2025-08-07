// components/RecordSales/RecordSalesForm.tsx
// This component is responsible for displaying and managing the sales records form.
// It includes functionality to add, update, and delete sales lines, as well as submit the form for approval.
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
import { Icon } from '@iconify/react/dist/iconify.js'
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
import { submitForApproval } from '@/lib/api'
import { VivoProduct, ProductSKU } from '@/types'

interface SalesLine {
  Officer_Code: any
  No: string
  SN: number
  Officer_Name: string
  Role_Name: string
  Product_Code?: string
  Target: number
  SKU_Code?: string // SKU_Code can be undefined
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
  header: {
    Region_Name: string
    Region_Code: string
    Outlet_Name: string
    Outlet_Code: string
  }
  onClose: () => void
  products: VivoProduct[]; // Receive products as prop
  SKU: ProductSKU[];       // Receive SKU as prop
}

export default function RecordSalesForm({
  No,
  header,
  onClose,
  products, // Destructure from props
  SKU,       // Destructure from props
}: RecordSalesFormProps) {
  const [lineItems, setLineItems] = useState<SalesLine[]>([])
  const [toast, setToast] = useState<Toast | null>(null)
  const [isApproving, setIsApproving] = useState(false)

  /**
   * Memoized SKU list. For a datalist, we typically provide all available options,
   * and the browser handles the filtering based on the input.
   */
  const filteredSKUs = useMemo(() => {
    return SKU;
  }, [SKU]); // Now depends on SKU prop

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  // Low-level PATCH helper
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

  // Per-row updater
  async function handlePatch(
    idx: number,
    payload: Partial<SalesLine>,
    field: string
  ) {
    // set updating flag
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

  // Field-specific handlers
  const handleProductChange = (i: number, code: string) =>
    handlePatch(i, { Product_Code: code }, 'Product')

  /**
   * Handles changes to the SKU input field.
   * If a valid SKU Code (from datalist selection) is entered, it updates the SKU_Code.
   * If the input is cleared, it sets SKU_Code to undefined, allowing re-selection.
   * If an invalid SKU is typed, it clears the SKU_Code and shows an error.
   * @param idx The index of the line item.
   * @param inputCode The SKU_Code (or empty string if cleared) from the input.
   */
  const handleSKUChange = (idx: number, inputCode: string) => {
    // If the input is cleared, set SKU_Code to undefined
    if (inputCode === '') {
      handlePatch(idx, { SKU_Code: undefined }, 'SKU');
      return;
    }

    // Find if the inputCode matches any SKU_Code from the fetched list
    const matchedSKU = SKU.find(s => s.SKU_Code === inputCode);

    if (matchedSKU) {
      // If a valid SKU is found, update the SKU_Code
      handlePatch(idx, { SKU_Code: matchedSKU.SKU_Code }, 'SKU');
    } else {
      // If no match is found, it means the user typed something invalid or incomplete.
      // Clear the SKU_Code for this line item and show an error toast.
      console.warn(`Invalid SKU entered for line ${idx}: ${inputCode}. Clearing SKU.`);
      handlePatch(idx, { SKU_Code: undefined }, 'SKU'); // Clear the SKU if it's not a valid match
      setToast({ type: 'error', message: `Invalid SKU: '${inputCode}'. Please select from the list.` });
    }
  };

  const handleQuantityChange = (i: number, qty: number) =>
    handlePatch(i, { Quantity: qty }, 'Quantity')

  /**
   * Deletes a sales line from the API and updates the local state.
   * @param idx The index of the line item to delete.
   */
  async function handleDeleteLine(idx: number) {
    const itemToDelete = lineItems[idx]
    if (!itemToDelete) return

    // Set updating flag for the row
    setLineItems(rows =>
      rows.map((r, i) => (i === idx ? { ...r, isUpdating: true } : r))
    )

    const url = `${API_BASE_URL}/NewSalesLines(No='${itemToDelete.No}',SN=${itemToDelete.SN})`
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: API_AUTHORIZATION,
          'If-Match': itemToDelete['@odata.etag'],
        },
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`HTTP ${res.status}: ${txt}`)
      }

      setLineItems(rows => rows.filter((_, i) => i !== idx))
      setToast({ type: 'success', message: 'Sales line deleted successfully.' })
    } catch (err: any) {
      console.error(err)
      setLineItems(rows =>
        rows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      )
      setToast({
        type: 'error',
        message: `Failed to delete sales line: ${err.message}`,
      })
    }
  }

  /**
   * Adds a new, empty sales line via the API and inserts it below the specified index.
   * Based on the "Control 'Officer Name' is read-only" error, the backend
   * automatically populates user details, so we should only send the 'No'
   * to create the new line item.
   */
  async function handleAddEmptyLineAfter(idx: number) {
    const row = lineItems[idx]
    if (!row) return

    setLineItems(rows =>
      rows.map((r, i) => (i === idx ? { ...r, isUpdating: true } : r))
    )

    // The most minimal and safest payload is just the 'No' to link the new line.
    // The backend should handle generating the rest of the fields with default values.
    const newPayload = { No: row.No, Officer_Code: row.Officer_Code, Product_Code: row.Product_Code }

    const url = `${API_BASE_URL}/NewSalesLines`
    console.log('Sending POST request to:', url, 'with payload:', newPayload)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: API_AUTHORIZATION,
        },
        body: JSON.stringify(newPayload),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`HTTP ${res.status}: ${txt}`)
      }

      const newLine = await res.json()
      setLineItems(rows => {
        const newRows = [...rows]
        // Insert the new line after the current index
        newRows.splice(idx + 1, 0, { ...newLine, isUpdating: false })
        // Set the original row back to not updating
        return newRows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      })
      setToast({ type: 'success', message: 'New sales line added.' })
    } catch (err: any) {
      console.error(err)
      setLineItems(rows =>
        rows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      )
      setToast({
        type: 'error',
        message: `Failed to add new sales line: ${err.message}`,
      })
    }
  }

  // Load line items on mount / No change
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

  // Removed the useEffect for fetching products and SKUs as they are now passed as props

  // Prevent form submit on Enter
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  // Send for approval
  const handleSendForApproval = async () => {
    setIsApproving(true)
    setToast(null)

    try {
      await submitForApproval(No)
      setToast({ type: 'success', message: 'Sent for approval' })

      // NEW: Delay closing the dialog to allow the user to see the success toast.
      setTimeout(onClose, 3000)
    } catch (err: any) {
      console.error(err)
      setToast({ type: 'error', message: err.message || 'Approval failed' })
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <Dialog open={!!No} onOpenChange={(open: boolean) => !open && onClose()}>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[99] p-4 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 ease-in-out transform
          ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          ${toast.type === 'success' ? 'animate-fade-in-down' : 'animate-fade-in-down'}`}
        >
          <Icon
            icon={toast.type === 'success' ? 'tabler:circle-check-filled' : 'tabler:circle-x-filled'}
            className="text-xl"
          />
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <DialogContent className="sm:max-w-8xl max-h-[98vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Sale No: {No}</DialogTitle>
            <DialogDescription>
              Review or adjust line items, then send for approval.
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
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendForApproval}
                disabled={isApproving}
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
                      {/* SKU Searchable Input */}
                      <TableCell>
                        <Input
                          list={`sku-options-${idx}`} // Link to datalist
                          className="w-full border rounded px-2 py-1"
                          disabled={item.isUpdating}
                          // Display the current SKU_Code.
                          // When a datalist option is selected, its value (SKU_Code) populates this input.
                          value={item.SKU_Code ?? ''}
                          onChange={e => handleSKUChange(idx, e.target.value)}
                          placeholder="Search SKU"
                        />
                        <datalist id={`sku-options-${idx}`}>
                          {/* Options display SKU_Name but their value is SKU_Code */}
                          {filteredSKUs.map(s => (
                            <option key={s.SKU_Code} value={s.SKU_Code}>
                              {s.SKU_Name}
                            </option>
                          ))}
                        </datalist>
                      </TableCell>
                      {/* End SKU Searchable Input */}
                      <TableCell>
                        <p className="text-right">
                          {item.SKU_Liters.toFixed(3)}
                        </p>
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
                        <p className="text-right">
                          {item.Total.toFixed(3)}
                        </p>
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
                              disabled={isApproving}
                            >
                              +
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteLine(idx)}
                              disabled={isApproving}
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
