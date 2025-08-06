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
import CreateNewHeaderCopy from '@/components/RecordSales/CreateNewHeaderCopy' // This import seems misplaced if it's only for RecordSales
import PendingRecordSalesViewWrapper from '@/components/RecordSales/PendingRecordSalesViewWrapper' // This should be correct for PendingSales
import type { VivoSalesHeader } from '@/types'

interface Props {
  data: VivoSalesHeader[]
}

export default function PendingSalesList({ data }: Props) {
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
        <h2 className="font-medium text-xl">Pending Sales</h2>
        {/* CreateNewHeaderCopy is likely only for Record Sales, consider removing if not needed here */}
        {/* <CreateNewHeaderCopy /> */}
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
                  colSpan={12}
                  className="text-center text-muted-foreground"
                >
                  No pending sales found.
                </TableCell>
              </TableRow>
            )}

            {data.map((sale) => (
              <TableRow key={sale.No}>
                <TableCell className="font-medium">
                  {/* this wrapper fetches NewSalesLines for sale.No */}
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
                <TableCell className="text-right">
                  {totalTarget.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {totalAchieved.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {totalCommission.toFixed(2)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </Card>

      {/* still render below the table if you need it */}
      {/* <CreateNewHeaderCopy /> */}
    </div>
  )
}
