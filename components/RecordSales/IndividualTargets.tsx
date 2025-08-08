// components/RecordSales/IndividualTargets.tsx
// This component allows users to view and manage individual sales targets.
// It displays a list of targets with options to select products, enter quantities, and calculate totals.
'use client'

import React, { useState } from 'react'
import {
   Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '../ui/table'
import { Card } from '../ui/card'
import {
   Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select'
import { IndividualTarget, ProductSKU, VivoProduct, VivoUserSessionDetails } from '@/types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { MinusCircle, PlusCircle, Trash2Icon } from 'lucide-react'

export function IndividualTargetsForm({
   targets,
   products,
   skus,
   user
}: {
   targets: IndividualTarget[],
   products?: VivoProduct[],
   skus?: ProductSKU[],
   user: VivoUserSessionDetails
}) {
   const [targetRows, setTargetRows] = useState(() =>
      targets.map(() => [
         { productCode: '', sku: null as ProductSKU | null, quantity: 0, cummulative_total: 0 }
      ])
   )

   const addRow = (targetIndex: number) => {
      setTargetRows(prev => {
         const updated = [...prev]
         updated[targetIndex] = [
            ...updated[targetIndex],
            { productCode: '', sku: null, quantity: 0, cummulative_total: 0 }
         ]
         return updated
      })
   }

   const removeRow = (targetIndex: number, rowIndex: number) => {
      setTargetRows(prev => {
         const updated = [...prev]
         updated[targetIndex] = updated[targetIndex].filter((_, i) => i !== rowIndex)
         return updated
      })
   }

   const updateRow = (
      targetIndex: number,
      rowIndex: number,
      field: 'productCode' | 'sku' | 'quantity' | 'cummulative_total',
      value: any
   ) => {
      setTargetRows(prev => {
         const updated = [...prev]
         const row = updated[targetIndex][rowIndex]
         if (field === 'sku') {
            const sku = skus?.find(s => s.SKU_Code === value) || null
            row.sku = sku
         } else if (field === 'productCode') {
            row.productCode = value
         } else if (field === 'quantity') {
            row.quantity = Number(value)
         } else if (field === 'cummulative_total') {
            row.cummulative_total = Number(value)
         }
         return updated
      })
   }


   return (
      <Card className="mt-4 bg-transparent p-4">
         <Table>
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
                  <TableHead>Cummulative Total (Ltrs)</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {targets.map((target, targetIndex) => {
                  const userRows = targetRows[targetIndex]

                  return userRows.map((row, rowIndex) => {
                     const totalLtrs = row.sku ? row.sku.SKU_Litres * row.quantity : 0
                     const cumulativeTotalLitres = targetRows.flat().reduce((sum, row) => {
                        return sum + (row.sku ? row.sku.SKU_Litres * row.quantity : 0);
                     }, 0);

                     const variance = cumulativeTotalLitres - target.Daily_Target
                     const defaultProduct = products?.find(p => p.Description === 'Retail Lubricants ') || null;
                     console.log('defaultProduct', defaultProduct)

                     return (
                        <TableRow key={`${targetIndex}-${rowIndex}`}>
                           {rowIndex === 0 && (
                              <>
                                 <TableCell rowSpan={userRows.length} className="font-medium w-[200px]">
                                    {target.User_Name}
                                 </TableCell>
                                 <TableCell rowSpan={userRows.length}>
                                    {target.Role_Name}
                                 </TableCell>

                                 <TableCell rowSpan={userRows.length}>
                                    <Select
                                       value={row.productCode}
                                       defaultValue={String(defaultProduct?.Description )|| ''}
                                       onValueChange={(val: any) => updateRow(targetIndex, rowIndex, 'productCode', val)}
                                    >
                                       <SelectTrigger className="w-[160px]">
                                          <SelectValue placeholder="Select Product" />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectGroup>
                                             {products?.map(p => (
                                                <SelectItem key={p.Code} value={p.Code}>
                                                   {p.Description}
                                                </SelectItem>
                                             ))}
                                          </SelectGroup>
                                       </SelectContent>
                                    </Select>
                                 </TableCell>
                                 <TableCell rowSpan={userRows.length}>{target.Daily_Target.toFixed(2)}</TableCell>
                              </>
                           )}


                           <TableCell>
                              <Select
                                 value={row.sku?.SKU_Code ?? ''}
                                 onValueChange={(val: any) => updateRow(targetIndex, rowIndex, 'sku', val)}
                                 
                              >
                                 <SelectTrigger className="w-[160px] mt-2">
                                    <SelectValue placeholder="SKU" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectGroup>
                                       {skus?.map(s => (
                                          <SelectItem key={s.SKU_Code} value={s.SKU_Code}>
                                             {s.SKU_Name}
                                          </SelectItem>
                                       ))}
                                    </SelectGroup>
                                 </SelectContent>
                              </Select>
                           </TableCell>
                           <TableCell>
                              <Input
                                 value={row.sku?.SKU_Litres ?? ''}
                                 readOnly
                                 className="bg-muted w-[120px]"
                              />
                           </TableCell>
                           <TableCell className='w-[200px]'>
                              <Input
                                 value={row.sku?.Grade ?? ''}
                                 readOnly
                                 className="bg-muted w-[120px]"
                              />
                           </TableCell>
                           <TableCell>
                              <Input
                                 type="number"
                                 value={row.quantity}
                                 onChange={(e) => updateRow(targetIndex, rowIndex, 'quantity', e.target.value)}
                                 className='w-[120px]'
                              />
                           </TableCell>
                           <TableCell>
                              <Input value={totalLtrs.toFixed(2)} readOnly className="bg-muted w-[120px]" />
                           </TableCell>
                           {rowIndex === 0 && (
                              <>
                                 <TableCell rowSpan={userRows.length}>
                                    <Input
                                      
                                       value={cumulativeTotalLitres.toFixed(2)} readOnly className="bg-muted w-[120px]" />
                                 </TableCell>
                                 <TableCell rowSpan={userRows.length}>
                                    <Input
                                       onChange={(e) => updateRow(targetIndex, rowIndex, 'cummulative_total', e.target.value)}
                                       value={variance} readOnly className="bg-muted w-[120px]" />
                                 </TableCell>
                              </>
                           )}


                           <TableCell className="flex items-center gap-2">
                              <PlusCircle
                                 className='text-primary cursor-pointer'
                                 size={20}
                                 onClick={() => addRow(targetIndex)}
                              >
                                 Add
                              </PlusCircle>
                              {userRows.length > 1 && (
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRow(targetIndex, rowIndex)}
                                 >
                                    <MinusCircle size={20} className=" text-red-500 cursor-pointer" />
                                 </Button>
                              )}
                           </TableCell>
                        </TableRow>
                     )
                  })
               })}
            </TableBody>
         </Table>
      </Card>
   )
}
