// components/RecordSales/CreateNewHeader.tsx
// This component allows users to create a new sales header.
// It uses a dialog to collect necessary information and submits it to the server.
'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Input } from '../ui/input'
import { createSalesHeader } from './actions'
import { useRouter } from 'next/navigation'

interface HeaderCardProps {
   "@odata.etag": string
   Region_Code: string
   Outlet_Code: string
}

const CreateNewHeader = () => {
   const [isPending, startTransition] = useTransition()
   const [state, formAction] = React.useActionState(createSalesHeader, null)
   const router = useRouter()

  const [createdNo, setCreatedNo] = useState<string | null>(null) // This state is not used in the provided logic

   const [formData, setFormData] = useState<HeaderCardProps>({
     "@odata.etag": "",
     Region_Code: "",
     Outlet_Code: "",
   })

   useEffect(() => {
     const stored = localStorage.getItem("vivoUser")

     if (stored) {
        try {
           const vivoUser = JSON.parse(stored)
           console.log("Parsed Vivo User:", vivoUser)

           setFormData({
               "@odata.etag": vivoUser["@odata.etag"] || "",
               Region_Code: vivoUser["region_code"] || "",
               Outlet_Code: vivoUser["outlet_code"] || "",
           })
        } catch (err) {
           console.error("Error parsing vivoUser from localStorage", err)
        }
     }
   }, [])

   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault()
     const formData = new FormData(event.currentTarget)
     startTransition(() => {
        formAction(formData)
     })
   }

   useEffect(() => {
     if (state?.success) {
        console.log("Created successfully")
        router.refresh()
     } else if (state?.error) {
        console.log('Error during creation', state?.error)
     }
   }, [state, router])

   return (
     <Dialog>
        <DialogTrigger asChild>
           <Button variant="outline">
              <Icon icon="mdi:plus" className="mr-2" /> Create New Header
           </Button>
        </DialogTrigger>
        <DialogContent>
           <DialogHeader>
              <DialogTitle>Create New Header</DialogTitle>
              <DialogDescription>Fields will be auto-filled from local storage.</DialogDescription>
           </DialogHeader>

           <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <Input
                name="@odata.etag"
                placeholder="ETag"
                defaultValue={formData["@odata.etag"]}
                readOnly
              />
              <Input
                name="Region_Code"
                placeholder="Region Code"
                defaultValue={formData.Region_Code}
                readOnly
              />
              <Input
                name="Outlet_Code"
                placeholder="Outlet Code"
                defaultValue={formData.Outlet_Code}
                readOnly
              />

              <Button type="submit" className="mt-2">
                 {isPending ? "Submitting..." : "Submit"}
              </Button>
           </form>
        </DialogContent>
     </Dialog>
   )
}

export default CreateNewHeader
