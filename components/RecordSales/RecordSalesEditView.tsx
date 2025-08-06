'use client'

import React, { useEffect, useState, FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../ui/table'
// Importing the new API functions and types from a single source
import {
  submitForApproval,
  fetchSalesLines,
  fetchVivoProducts,
  fetchLubricantSKUs,
  updateSalesLine,
  deleteSalesLine,
  addSalesLine,
} from '@/lib/api'
// Importing types directly from '@/types'
import { SalesLine, VivoProduct, ProductSKU } from '@/types'


type Toast = {
  type: 'success' | 'error'
  message: string
}

interface RecordSalesEditViewProps { // Renamed interface
  No: string
  header: {
    Region_Name: string
    Region_Code: string
    Outlet_Name: string
    Outlet_Code: string
  }
  onClose: () => void
  isOpen: boolean // Added isOpen prop to control dialog visibility
}

export default function RecordSalesEditView({ // Renamed component
  No,
  header,
  onClose,
  isOpen,
}: RecordSalesEditViewProps) {
  const [lineItems, setLineItems] = useState<SalesLine[]>([])
  const [products, setProducts] = useState<VivoProduct[]>([])
  const [SKU, setSKU] = useState<ProductSKU[]>([])
  const [toast, setToast] = useState<Toast | null>(null)
  const [isApproving, setIsApproving] = useState(false)

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  // Per-row updater using the new API function
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
      // Use the updateSalesLine API function
      const updated = await updateSalesLine(
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
  const handleSKUChange = (i: number, code: string) =>
    handlePatch(i, { SKU_Code: code }, 'SKU')
  const handleQuantityChange = (i: number, qty: number) =>
    handlePatch(i, { Quantity: qty }, 'Quantity')

  /**
   * Deletes a sales line from the API and updates the local state.
   * Uses the new deleteSalesLine API function.
   * @param idx The index of the line item to delete.
   */
  async function handleDeleteLine(idx: number) {
    const itemToDelete = lineItems[idx]
    if (!itemToDelete) return

    // Set updating flag for the row
    setLineItems(rows =>
      rows.map((r, i) => (i === idx ? { ...r, isUpdating: true } : r))
    )

    try {
      // Use the new deleteSalesLine API function
      await deleteSalesLine(itemToDelete.No, itemToDelete.SN, itemToDelete['@odata.etag'])

      setLineItems(rows => rows.filter((_, i) => i !== idx))
      setToast({ type: 'success', message: 'Sales line deleted successfully.' })
    } catch (err: any) {
      console.error(err)
      setLineItems(rows =>
        rows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      )
      setToast({ type: 'error', message: `Failed to delete sales line: ${err.message}` })
    }
  }

  /**
   * Adds a new, empty sales line via the API and inserts it below the specified index.
   * Uses the new addSalesLine API function.
   */
  async function handleAddEmptyLineAfter(idx: number) {
    const row = lineItems[idx]
    if (!row) return

    setLineItems(rows =>
      rows.map((r, i) => (i === idx ? { ...r, isUpdating: true } : r))
    )

    try {
      // Use the new addSalesLine API function
      const newLine = await addSalesLine(No)

      setLineItems(rows => {
        const newRows = [...rows]
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
      setToast({ type: 'error', message: `Failed to add new sales line: ${err.message}` })
    }
  }

  // Load line items when dialog opens or No changes
  useEffect(() => {
    if (!No || !isOpen) return // Only fetch if dialog is open and No is available
    fetchSalesLines(No)
      .then(d => setLineItems(d))
      .catch(console.error)
  }, [No, isOpen]) // Depend on isOpen

  // Load lookup data once
  useEffect(() => {
    fetchVivoProducts()
      .then(d => setProducts(d))
      .catch(console.error)

    fetchLubricantSKUs()
      .then(d => setSKU(d))
      .catch(console.error)
  }, [])

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

      // Delay closing the dialog to allow the user to see the success toast.
      setTimeout(onClose, 3000)
    } catch (err: any) {
      console.error(err)
      setToast({ type: 'error', message: err.message || 'Approval failed' })
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}> {/* Use isOpen prop here */}
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

          {/* Header info + Actions */}
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

          {/* Line Items Table */}
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
                  {lineItems.map((item) => ( // Removed idx from map function as it's not needed in key
                    <TableRow
                      key={`${item.No}-${item.SN}`} // Key now relies solely on item.No and item.SN
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
                            handleProductChange(lineItems.indexOf(item), e.target.value) // Use indexOf for idx
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
                        <p className="text-right">{(item.Target ?? 0).toFixed(2)}</p>
                      </TableCell>
                      <TableCell>
                        <select
                          className="w-full border rounded px-2 py-1"
                          disabled={item.isUpdating}
                          value={item.SKU_Code ?? ''}
                          onChange={e => handleSKUChange(lineItems.indexOf(item), e.target.value)} // Use indexOf for idx
                        >
                          <option value="">Select SKU</option>
                          {SKU.map(s => (
                            <option key={s.SKU_Code} value={s.SKU_Code}>
                              {s.SKU_Name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">
                          {(item.SKU_Liters ?? 0).toFixed(3)}
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
                            handleQuantityChange(lineItems.indexOf(item), Number(e.target.value)) // Use indexOf for idx
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <p className="text-right">
                          {(item.Total ?? 0).toFixed(3)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">
                          {(item.SKU_Ratio ?? 0).toFixed(3)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">
                          {(item.Commission_Earned ?? 0).toFixed(2)}
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
                              onClick={() => handleAddEmptyLineAfter(lineItems.indexOf(item))} // Use indexOf for idx
                              disabled={isApproving}
                            >
                              +
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteLine(lineItems.indexOf(item))} // Use indexOf for idx
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
