// components/RecordSales/IndividualTargets copy.tsx
// This component allows users to view and manage individual sales targets.
// It displays a list of targets with options to select products, enter quantities, and calculate totals.
'use client'

import { useState } from 'react'
import type {
  VivoUserSessionDetails,
  IndividualTarget,
  ProductSKU,
  VivoProduct,
} from '@/types'
import { getUserFromClient } from '@/lib/get-user.client'

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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface IndividualTargetsFormProps {
  targets: IndividualTarget[]
  products?: VivoProduct[]
  skus?: ProductSKU[]
}

export function IndividualTargetsForm({
  targets,
  products,
  skus,
}: IndividualTargetsFormProps) {
  const [user, setUser] = useState<VivoUserSessionDetails | null>(null)
  const [rowStates, setRowStates] = useState<Record<number, { sku: ProductSKU | null; quantity: number }>>({})

  // load user session on mount
  useState(() => {
    setUser(getUserFromClient())
  })

  const handleSKUSelect = (index: number, skuCode: string) => {
    const sku = skus?.find((s) => s.SKU_Code === skuCode) || null
    setRowStates((prev) => ({ ...prev, [index]: { sku, quantity: prev[index]?.quantity ?? 0 } }))
  }

  const handleQuantityChange = (index: number, value: number) => {
    setRowStates((prev) => ({
      ...prev,
      [index]: {
        sku: prev[index]?.sku || null,
        quantity: value,
      },
    }))
  }

  // Render a simple product picker if needed
  const ProductPicker = () => (
    <Select onValueChange={(desc) => console.log('picked product', desc)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Product" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {products?.map((p) => (
            <SelectItem key={p.Code} value={p.Description}>
              {p.Description}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )

  if (!user) {
    return <div className="text-red-500">User not found. Please log in.</div>
  }

  return (
    <Card className="mt-4 bg-transparent p-4">
      <Table>
        <TableCaption>Individual Sales Targets for {user.username}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Target (Ltrs)</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Litres</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total (Ltrs)</TableHead>
            <TableHead>Variance (Ltrs)</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {targets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center text-muted-foreground">
                No sales targets found.
              </TableCell>
            </TableRow>
          ) : (
            targets.map((t, i) => {
              const { sku, quantity } = rowStates[i] || { sku: null, quantity: 0 }
              const totalLitres = sku?.SKU_Litres ? sku.SKU_Litres * quantity : 0
              const variance = totalLitres - t.Daily_Target

              return (
                <TableRow key={i}>
                  <TableCell>{t.User_Name}</TableCell>
                  <TableCell>{t.Role_Name}</TableCell>
                  <TableCell><ProductPicker /></TableCell>
                  <TableCell>{t.Daily_Target.toFixed(3)}</TableCell>
                  <TableCell>
                    <Select onValueChange={(val) => handleSKUSelect(i, val)}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select SKU" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {skus?.map((s) => (
                            <SelectItem key={s.SKU_Code} value={s.SKU_Code}>
                              {s.SKU_Name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{sku?.SKU_Litres.toFixed(3) ?? ''}</TableCell>
                  <TableCell>{sku?.Grade ?? ''}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(i, Number(e.target.value))}
                      className="mt-2"
                    />
                  </TableCell>
                  <TableCell>{totalLitres.toFixed(3)}</TableCell>
                  <TableCell>{variance.toFixed(3)}</TableCell>
                  <TableCell>{/* commission logic here */}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => console.log('Add target', i)}>Add</Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </Card>
  )
}