'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
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
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import CreateNewHeaderCopy from './CreateNewHeaderCopy'
import RecordSalesEditView from './RecordSalesEditView' // Updated import name
import { VivoSalesHeader } from '@/types'

interface Props {
  data: VivoSalesHeader[]
}

export function RecordSalesList({ data }: Props) {
  const [selectedSaleNo, setSelectedSaleNo] = useState<string | null>(null);
  const [isRecordSalesEditViewOpen, setIsRecordSalesEditViewOpen] = useState(false);

  // compute grand totals
  const { totalTarget, totalAchieved, totalCommission } = useMemo(() => {
    return data.reduce(
      (acc, s) => {
        acc.totalTarget += s.Total_Target ?? 0
        acc.totalAchieved += s.Total_Achieved ?? 0
        acc.totalCommission += s.Total_Commission_Earned ?? 0
        return acc
      },
      { totalTarget: 0, totalAchieved: 0, totalCommission: 0 }
    )
  }, [data])

  const handleOpenRecordSalesEditView = (saleNo: string) => {
    setSelectedSaleNo(saleNo);
    setIsRecordSalesEditViewOpen(true);
  };

  const handleCloseRecordSalesEditView = () => {
    setSelectedSaleNo(null);
    setIsRecordSalesEditViewOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-xl">Record Sales</h2>
        <CreateNewHeaderCopy />
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
                  No sales records found.
                </TableCell>
              </TableRow>
            )}

            {data.map((sale) => (
              <TableRow key={sale.No}>
                <TableCell className="font-medium">
                  {/* Open RecordSalesEditView directly */}
                  <Button variant="link" onClick={() => handleOpenRecordSalesEditView(sale.No)}>
                    {sale.No}
                  </Button>
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

      {/* Render RecordSalesEditView when a sale is selected */}
      {isRecordSalesEditViewOpen && selectedSaleNo && (
        <RecordSalesEditView
          No={selectedSaleNo}
          header={data.find(s => s.No === selectedSaleNo) || { Region_Name: '', Region_Code: '', Outlet_Name: '', Outlet_Code: '' }}
          onClose={handleCloseRecordSalesEditView}
          isOpen={isRecordSalesEditViewOpen}
        />
      )}

      {/* still render below the table if you need it */}
      {/* <CreateNewHeaderCopy /> */}
    </div>
  )
}
