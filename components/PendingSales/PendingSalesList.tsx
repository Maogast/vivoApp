'use client'

import React, { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
  TableFooter,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PendingRecordSalesViewWrapper from '@/components/RecordSales/PendingRecordSalesViewWrapper'
import type { VivoSalesHeader } from '@/types'

/**
 * Props interface for the PendingSalesList component.
 * @property {VivoSalesHeader[]} data - An array of sales header records to display.
 */
interface PendingSalesListProps {
  data: VivoSalesHeader[]
}

/**
 * PendingSalesList component displays a filterable list of pending sales records.
 * It allows users to filter sales by date, region, and outlet name, and shows
 * aggregated totals for the filtered data. Each sales record number is a clickable
 * link to view more details via the PendingRecordSalesViewWrapper.
 */
export default function PendingSalesList({ data }: PendingSalesListProps) {
  // State variables for managing filter inputs
  const [filterDate, setFilterDate] = useState<string>('')
  const [filterRegion, setFilterRegion] = useState<string>('')
  const [filterOutletName, setFilterOutletName] = useState<string>('')

  /**
   * Memoized filtered data based on the current filter criteria.
   * This re-runs only when 'data' or any of the filter states change,
   * optimizing performance by avoiding unnecessary re-calculations.
   */
  const filteredData = useMemo(() => {
    return data.filter(sale => {
      // Check if the sale's captured date matches the filter date (if provided)
      const matchesDate = filterDate
        ? sale.Date_Captured === filterDate
        : true

      // Check if the sale's region name or code includes the filter region text (case-insensitive)
      const matchesRegion = filterRegion
        ? sale.Region_Name.toLowerCase().includes(filterRegion.toLowerCase()) ||
          sale.Region_Code.toLowerCase().includes(filterRegion.toLowerCase())
        : true

      // Check if the sale's outlet name includes the filter outlet name text (case-insensitive)
      const matchesOutletName = filterOutletName
        ? sale.Outlet_Name.toLowerCase().includes(filterOutletName.toLowerCase())
        : true

      // A sale record matches all filters if all individual match conditions are true
      return matchesDate && matchesRegion && matchesOutletName
    })
  }, [data, filterDate, filterRegion, filterOutletName])

  /**
   * Memoized calculation of grand totals (Target, Achieved, Commission)
   * for the currently filtered sales headers. This ensures totals are
   * re-calculated only when `filteredData` changes.
   */
  const { totalTarget, totalAchieved, totalCommission } = useMemo(
    () =>
      filteredData.reduce(
        (acc, h) => {
          // Accumulate totals, using nullish coalescing to default to 0 if values are null/undefined
          acc.totalTarget += h.Total_Target ?? 0
          acc.totalAchieved += h.Total_Achieved ?? 0
          acc.totalCommission += h.Total_Commission_Earned ?? 0
          return acc
        },
        { totalTarget: 0, totalAchieved: 0, totalCommission: 0 } // Initial accumulator values
      ),
    [filteredData] // Dependency array: re-calculate when filteredData changes
  )

  return (
    <div>
      {/* Page Title Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-xl text-gray-800">Pending Sales</h2>
      </div>

      {/* Filter Section Card */}
      <Card className="mb-6 p-4 bg-white shadow-sm rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Filter Sales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Captured Filter */}
          <div>
            <Label htmlFor="filterDate" className="text-sm font-medium text-gray-600">Date Captured</Label>
            <Input
              id="filterDate"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
          {/* Region Name/Code Filter */}
          <div>
            <Label htmlFor="filterRegion" className="text-sm font-medium text-gray-600">Region Name/Code</Label>
            <Input
              id="filterRegion"
              type="text"
              placeholder="e.g., South Rift, East Rift"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
          {/* Outlet Name Filter */}
          <div>
            <Label htmlFor="filterOutletName" className="text-sm font-medium text-gray-600">Outlet Name</Label>
            <Input
              id="filterOutletName"
              type="text"
              placeholder="e.g., Narok Ilmashariani Service Station"
              value={filterOutletName}
              onChange={(e) => setFilterOutletName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
        </div>
      </Card>

      {/* Sales Table Card */}
      <Card className="mt-4 bg-white shadow-sm rounded-lg h-[80vh] overflow-auto">
        <Table>
          <TableCaption className="text-gray-500 py-2">
            Sales records for {data[0]?.Outlet_Name || '—'} (Filtered)
          </TableCaption>

          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[100px] text-gray-600">No</TableHead>
              <TableHead className="text-gray-600">Outlet Code</TableHead>
              <TableHead className="text-gray-600">Outlet Name</TableHead>
              <TableHead className="text-gray-600">Region Code</TableHead>
              <TableHead className="text-gray-600">Region Name</TableHead>
              <TableHead className="text-gray-600">Sales Date</TableHead>
              <TableHead className="text-gray-600">Date Captured</TableHead>
              <TableHead className="text-gray-600">Time Captured</TableHead>
              <TableHead className="text-right text-gray-600">Target (Ltrs)</TableHead>
              <TableHead className="text-right text-gray-600">Achieved (Ltrs)</TableHead>
              <TableHead className="text-right text-gray-600">Commission (KES)</TableHead>
              <TableHead className="text-gray-600">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Conditional rendering for no matching data */}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="text-center text-muted-foreground py-8"
                >
                  No pending sales found matching your filters. 😔
                </TableCell>
              </TableRow>
            )}

            {/* Map and render each filtered sales record */}
            {filteredData.map((sale) => (
              <TableRow key={sale.No} className="hover:bg-gray-100 transition-colors">
                <TableCell className="font-medium text-blue-600 hover:underline cursor-pointer">
                  {/* This wrapper fetches NewSalesLines for sale.No and opens a detailed view */}
                  <PendingRecordSalesViewWrapper No={sale.No} />
                </TableCell>
                <TableCell>{sale.Outlet_Code}</TableCell>
                <TableCell>{sale.Outlet_Name}</TableCell>
                <TableCell>{sale.Region_Code}</TableCell>
                <TableCell>{sale.Region_Name}</TableCell>
                <TableCell>{sale.Sales_Date}</TableCell>
                <TableCell>{sale.Date_Captured}</TableCell>
                <TableCell>{sale.Time_Captured}</TableCell>
                <TableCell className="text-right">
                  {sale.Total_Target.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {sale.Total_Achieved.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {sale.Total_Commission_Earned.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={sale.Status === 'Open' ? 'secondary' : 'destructive'}
                    className="px-2 py-1 rounded-full text-xs font-semibold"
                  >
                    {sale.Status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          {/* Table Footer for displaying totals */}
          {filteredData.length > 0 && (
            <TableFooter className="bg-gray-100 font-bold">
              <TableRow>
                <TableCell colSpan={8} className="text-right text-gray-800">Totals (Filtered)</TableCell>
                <TableCell className="text-right text-gray-800">
                  {totalTarget.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-gray-800">
                  {totalAchieved.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-gray-800">
                  {totalCommission.toFixed(2)}
                </TableCell>
                <TableCell /> {/* Empty cell for the Status column */}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </Card>
    </div>
  )
}
