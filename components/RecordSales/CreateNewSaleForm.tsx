// components/RecordSales/CreateNewSaleForm.tsx
// This component allows users to create a new sales record.
// It uses a dialog to collect necessary information and submits it to the server.
'use client'

import { useEffect, useState } from 'react'
import { getUserFromClient } from '@/lib/get-user.client'
import type {
  VivoUserSessionDetails,
  ProductSKU,
  IndividualTarget,
} from '@/types'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select'
import { Icon } from '@iconify/react'

interface CreateNewSaleFormProps {
  skus?: ProductSKU[]
  target?: IndividualTarget
}

export function CreateNewSaleForm({ skus, target }: CreateNewSaleFormProps) {
  // 1. Load the current user from cookies
  const [user, setUser] = useState<VivoUserSessionDetails | null>(null)
  useEffect(() => {
    setUser(getUserFromClient())
  }, [])

  // 2. Local form state
  const [selectedSKU, setSelectedSKU] = useState<ProductSKU | null>(null)
  const [quantity, setQuantity] = useState<number>(0)
  const totalLitres = selectedSKU ? selectedSKU.SKU_Litres * quantity : 0

  // 3. Guard against missing user
  if (user === null) {
    return (
      <div className="text-red-500">
        User not found. Please log in.
      </div>
    )
  }

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="default">
            <Icon icon="solar:add-circle-linear" className="text-xl text-white" />
            New Sale
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>Add Sale for: {user.username}</DialogTitle>
            <DialogDescription>
              Fill in the SKU, quantity and review totals before saving.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* Target (from optional prop) */}
            <div>
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                name="target"
                defaultValue={target?.Daily_Target.toString() ?? ''}
                className="mt-2"
              />
            </div>

            {/* SKU selector */}
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Select onValueChange={(code) => {
                const sku = skus?.find((s) => s.SKU_Code === code) ?? null
                setSelectedSKU(sku)
              }}>
                <SelectTrigger id="sku" className="w-full mt-2">
                  <SelectValue placeholder="Select SKU" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {skus?.map((sku) => (
                      <SelectItem key={sku.SKU_Code} value={sku.SKU_Code}>
                        {sku.SKU_Name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* SKU details */}
            <div>
              <Label htmlFor="litres">Litres per unit</Label>
              <Input
                id="litres"
                name="litres"
                value={selectedSKU?.SKU_Litres.toString() ?? ''}
                readOnly
                className="mt-2 bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                name="grade"
                value={selectedSKU?.Grade ?? ''}
                readOnly
                className="mt-2 bg-muted"
              />
            </div>

            {/* Quantity input */}
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-2"
              />
            </div>

            {/* Computed totals */}
            <div>
              <Label htmlFor="total_litres">Total (Litres)</Label>
              <Input
                id="total_litres"
                name="total_litres"
                value={totalLitres.toFixed(3)}
                readOnly
                className="mt-2 bg-muted"
              />
            </div>

            {/* Variance & Commission placeholders */}
            <div>
              <Label htmlFor="variance">Variance (Litres)</Label>
              <Input
                id="variance"
                name="variance"
                defaultValue=""
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="commission">Commission</Label>
              <Input
                id="commission"
                name="commission"
                defaultValue=""
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}