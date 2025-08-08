// components/RecordSales/RecordNewSale copy.tsx
// This component allows users to create a new sales record.
// It uses a dialog to collect necessary information and submits it to the server.
'use client'
import React from 'react'
import VivoUserDetails from './VivoUserDetails';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Icon } from '@iconify/react/dist/iconify.js';
import { getUserData } from '@/lib/get-user';

export async function RecordNewSale() {
   const user = await getUserData();
   if (!user) {
      return (
         <div className="text-red-500">
            User not found. Please log in.
         </div>
      );
   }
  
   return (
      <div>
         <Dialog>
            <form>
               <DialogTrigger asChild>
                  <Button variant="default">
                     <Icon icon="solar:add-circle-linear" className='text-xl text-white' />
                     New Sale</Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-fit max-h-[95vh] overflow-y-auto overflow-x-auto">
                  <DialogHeader>
                     <DialogTitle>Add Sale For : USERNAME</DialogTitle>
                     <DialogDescription>

                     </DialogDescription>
                  </DialogHeader>
                  <h1 className="text-2xl font-bold mb-4">Record New Sale</h1>
                  <div className='flex items-center justify-end gap-4'>
                     <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                     </DialogClose>
                     <Button type="submit">Save & send for Approval </Button>

                  </div>
                  <VivoUserDetails />

                  {/* <IndividualTargetsForm
                     targets={individualTargetsData}
                     products={vivoProductsData}
                     skus={vivoSKUsData}
                     user={user}
                  /> */}
                
               </DialogContent>
            </form>
         </Dialog>
      </div>
   )
}

