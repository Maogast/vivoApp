'use client'

import React, { useMemo } from 'react'
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
import ApprovedRecordSalesViewWrapper from './ApprovedRecordSalesViewWrapper' // Import the new wrapper
import type { VivoSalesHeader } from '@/types' // Import VivoSalesHeader from types

interface Props {
  data: VivoSalesHeader[];
  username: string; // Add username prop
}

export function ApprovedSalesList({ data, username }: Props) { // Destructure username
  // Compute grand totals across all headers
  const { totalTarget, totalAchieved, totalCommission } = useMemo(
    () =>
      data.reduce(
        (acc, h) => {
          acc.totalTarget += h.Total_Target ?? 0
          acc.totalAchieved += h.Total_Achieved ?? 0
          acc.totalCommission += h.Total_Commission_Earned ?? 0
          return acc
        },
        { totalTarget: 0, totalAchieved: 0, totalCommission: 0 }
      ),
    [data]
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-xl">Approved Sales</h2>
      </div>

      <Card className="mt-4 bg-transparent h-[80vh] overflow-auto">
        <Table>
          <TableCaption>
            Sales records for {data[0]?.Outlet_Name || '—'}
          </TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">No</TableHead>
              <TableHead>Outlet Code</TableHead>
              <TableHead>Outlet Name</TableHead>
              <TableHead>Region Code</TableHead>
              <TableHead>Region Name</TableHead>
              <TableHead>Sales Date</TableHead>
              <TableHead>Date Captured</TableHead>
              <TableHead>Time Captured</TableHead>
              <TableHead className="text-right">Target (Ltrs)</TableHead>
              <TableHead className="text-right">Achieved (Ltrs)</TableHead>
              <TableHead className="text-right">Commission (KES)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={12} // Updated colspan to match the 12 columns
                  className="text-center text-muted-foreground"
                >
                  No approved sales found.
                </TableCell>
              </TableRow>
            )}

            {data.map((sale) => (
              <TableRow key={sale.No} className="even:bg-gray-50">
                <TableCell className="font-medium">
                  {/* Use the new ApprovedRecordSalesViewWrapper here, passing username */}
                  <ApprovedRecordSalesViewWrapper No={sale.No} username={username} />
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
                    variant={sale.Status === 'Approved' ? 'default' : 'secondary'} // Assuming 'Approved' status
                  >
                    {sale.Status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          {data.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={8}>Totals</TableCell>
                <TableCell className="text-right font-bold">
                  {totalTarget.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {totalAchieved.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {totalCommission.toFixed(2)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </Card>
    </div>
  )
}
