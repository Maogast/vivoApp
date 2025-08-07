// components/RecordSales/RecordSalesList.tsx
// This component displays a list of sales records with options to create new headers and edit existing records.
// It uses a table to present the data and includes functionality for viewing details of each sale.
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
import { Input } from '../ui/input' // Import Input for filter fields
import { Label } from '../ui/label' // Import Label for filter fields
import { ChevronDown, ChevronUp } from 'lucide-react'; // Import icons for collapsible
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'; // Import Collapsible components


interface Props {
  data: VivoSalesHeader[]
}

export function RecordSalesList({ data }: Props) {
  const [selectedSaleNo, setSelectedSaleNo] = useState<string | null>(null);
  const [isRecordSalesEditViewOpen, setIsRecordSalesEditViewOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true); // State to manage collapsible filter

  // State for filter inputs
  const [filterNo, setFilterNo] = useState<string>('');
  const [filterSalesDate, setFilterSalesDate] = useState<string>('');
  const [filterRegionName, setFilterRegionName] = useState<string>('');
  const [filterOutletName, setFilterOutletName] = useState<string>('');


  // Memoized filtered data based on input filters
  const filteredData = useMemo(() => {
    return data.filter(sale => {
      const matchesNo = filterNo
        ? sale.No.toLowerCase().includes(filterNo.toLowerCase())
        : true;
      const matchesSalesDate = filterSalesDate
        ? sale.Sales_Date.toLowerCase().includes(filterSalesDate.toLowerCase())
        : true;
      const matchesRegionName = filterRegionName
        ? sale.Region_Name.toLowerCase().includes(filterRegionName.toLowerCase())
        : true;
      const matchesOutletName = filterOutletName
        ? sale.Outlet_Name.toLowerCase().includes(filterOutletName.toLowerCase())
        : true;

      return matchesNo && matchesSalesDate && matchesRegionName && matchesOutletName;
    });
  }, [data, filterNo, filterSalesDate, filterRegionName, filterOutletName]);

  // compute grand totals based on filtered data
  const { totalTarget, totalAchieved, totalCommission } = useMemo(() => {
    return filteredData.reduce(
      (acc, s) => {
        acc.totalTarget += s.Total_Target ?? 0
        acc.totalAchieved += s.Total_Achieved ?? 0
        acc.totalCommission += s.Total_Commission_Earned ?? 0
        return acc
      },
      { totalTarget: 0, totalAchieved: 0, totalCommission: 0 }
    )
  }, [filteredData])

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

      {/* Collapsible Filter Section */}
      <Collapsible
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        className="w-full space-y-2 mb-4"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-md">
          <h4 className="text-sm font-semibold">
            Filters
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {isFilterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="sr-only">Toggle filters</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filterNo">Filter by Sale No</Label>
              <Input
                id="filterNo"
                type="text"
                placeholder="Enter Sale No"
                value={filterNo}
                onChange={(e) => setFilterNo(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="filterSalesDate">Filter by Sales Date</Label>
              <Input
                id="filterSalesDate"
                type="date"
                placeholder="Select Sales Date"
                value={filterSalesDate}
                onChange={(e) => setFilterSalesDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="filterRegionName">Filter by Region Name</Label>
              <Input
                id="filterRegionName"
                type="text"
                placeholder="Enter Region Name"
                value={filterRegionName}
                onChange={(e) => setFilterRegionName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="filterOutletName">Filter by Outlet Name</Label>
              <Input
                id="filterOutletName"
                type="text"
                placeholder="Enter Outlet Name"
                value={filterOutletName}
                onChange={(e) => setFilterOutletName(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

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
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="text-center text-muted-foreground"
                >
                  No sales records found matching your filters.
                </TableCell>
              </TableRow>
            )}

            {filteredData.map((sale) => (
              <TableRow key={sale.No}>
                <TableCell className="font-medium">
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

          {filteredData.length > 0 && (
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
          header={filteredData.find(s => s.No === selectedSaleNo) || { Region_Name: '', Region_Code: '', Outlet_Name: '', Outlet_Code: '' }}
          onClose={handleCloseRecordSalesEditView}
          isOpen={isRecordSalesEditViewOpen}
        />
      )}
    </div>
  )
}
