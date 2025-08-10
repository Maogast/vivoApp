'use client'

import React, { useState, useEffect } from 'react'
import { endpoints } from '@/lib/endpoints' // Use the correct path for endpoints
import { fetchData } from '@/lib/api' // Import fetchData
import {
  SalesLine, // Import SalesLine from types
  VivoSalesHeader, // Import VivoSalesHeader from types
} from '@/types' // Import types from the central types file
import { getUserFromClient } from '@/lib/get-user.client' // Updated import path


import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table'
import { Icon } from '@iconify/react/dist/iconify.js' // For loading spinner

interface Props {
  No: string;
  username: string; // Prop for the captured by username
}

export default function ApprovedRecordsSalesView({ No, username }: Props) {
  const [header, setHeader] = useState<VivoSalesHeader | null>(null)
  const [lineItems, setLineItems] = useState<SalesLine[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Fetch header + lines when dialog opens (or when 'No' changes)
  useEffect(() => {
    if (!No) return

    const fetchAll = async () => {
      setLoading(true)
      try {
        const [hdr, lines] = await Promise.all([
          fetchData<{ value: VivoSalesHeader[] }>(
            endpoints.recordSales.headerDetails(No)
          ),
          fetchData<{ value: SalesLine[] }>(endpoints.recordSales.newSalesLines(No)),
        ])
        setHeader(hdr.value?.[0] ?? null)
        setLineItems(lines.value ?? [])
      } catch (err) {
        console.error('Data fetch error:', err)
        setMessage('❌ Failed to fetch sales data.')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [No])

  return (
    <DialogContent className="sm:max-w-[95vw] max-h-[95vh] p-0 flex flex-col overflow-hidden">
      {message && (
        <div
          className={`p-4 ${
            message.startsWith('✅')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <DialogHeader className="px-4 py-3 border-b">
        <DialogTitle>Approved Sale #{No}</DialogTitle>
        <DialogDescription>
          Details of the approved sales record. This view is read-only.
        </DialogDescription>
      </DialogHeader>

      <div className="bg-white border-b px-4 py-4 sticky top-0 z-20 flex justify-between items-start flex-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <Label className="uppercase text-xs text-gray-600">
              Sale No
            </Label>
            <Input defaultValue={No} readOnly className="mt-1" />
          </div>
          <div className="flex flex-col">
            <Label className="uppercase text-xs text-gray-600">Region</Label>
            <Input
              defaultValue={header?.Region_Name || ''}
              readOnly
              className="mt-1"
            />
          </div>
          <div className="flex flex-col">
            <Label className="uppercase text-xs text-gray-600">
              Region Code
            </Label>
            <Input
              defaultValue={header?.Region_Code || ''}
              readOnly
              className="mt-1"
            />
          </div>
          <div className="flex flex-col">
            <Label className="uppercase text-xs text-gray-600">Outlet</Label>
            <Input
              defaultValue={header?.Outlet_Name || ''}
              readOnly
              className="mt-1"
            />
          </div>
          <div className="flex flex-col">
            <Label className="uppercase text-xs text-gray-600">
              Outlet Code
            </Label>
            <Input
              defaultValue={header?.Outlet_Code || ''}
              readOnly
              className="mt-1"
            />
          </div>
          <div className="flex flex-col">
            <Label className="uppercase text-xs text-gray-600">
              Captured Date
            </Label>
            <Input
              type="date"
              defaultValue={header?.Date_Captured || ''} // Use actual captured date
              readOnly
              className="mt-1"
            />
          </div>
          <div className="flex flex-col">
            <Label className="uppercase text-xs text-gray-600">
              Captured Time
            </Label>
            <Input
              type="time"
              defaultValue={header?.Time_Captured || ''} // Use actual captured time
              readOnly
              className="mt-1"
            />
          </div>
          <div className="flex flex-col">
            <Label className="uppercase text-xs text-gray-600">
              Sales Date
            </Label>
            <Input
              type="date"
              defaultValue={header?.Sales_Date || ''} // Use actual sales date
              readOnly
              className="mt-1"
            />
          </div>
          {/* NEW: Captured By field */}
          <div className="flex flex-col">
            <Label className="uppercase text-xs text-gray-600">Captured By</Label>
            <Input
              id="captured-by"
              name="captured_by"
              defaultValue={username} // Use the passed username prop
              readOnly
              className="mt-1"
            />
          </div>
        </div>
        {/* No action buttons here */}
      </div>

      <div className="overflow-y-auto flex-1 px-4 py-4 pb-16">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Icon icon="solar:spinner-loop-bold" className="animate-spin text-4xl text-gray-500" />
          </div>
        ) : (
          <Card className="bg-transparent p-0">
            <Table>
              <TableCaption>Individual Sales Targets</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>SKU Ltrs</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>SKU Ratio</TableHead>
                  <TableHead>Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground">
                      No line items found for this approved sale.
                    </TableCell>
                  </TableRow>
                ) : (
                  lineItems.map((item, idx) => (
                    <TableRow key={`${item.No}-${item.SN}-${idx}`}>
                      <TableCell>{item.Officer_Name}</TableCell>
                      <TableCell>{item.Role_Name}</TableCell>
                      <TableCell>{item.Product_Code}</TableCell>
                      <TableCell>{item.Target}</TableCell>
                      <TableCell>{item.SKU_Code}</TableCell>
                      <TableCell>{item.SKU_Liters}</TableCell>
                      <TableCell>{item.Grade}</TableCell>
                      <TableCell>{item.Quantity}</TableCell>
                      <TableCell>{item.Total}</TableCell>
                      <TableCell>{item.SKU_Ratio}</TableCell>
                      <TableCell>{item.Commission_Earned}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </DialogContent>
  )
}
