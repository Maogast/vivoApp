/*import { Button } from "@/components/ui/button"
import {
   Dialog,
   DialogClose,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserData } from "@/lib/get-user"
import { Icon } from "@iconify/react/dist/iconify.js"

export async function CreateNewSale() {
   const user = await getUserData();
   if (!user) {
      return (
         <div className="text-red-500">
            User not found. Please log in.
         </div>
      );
   }

   return (
      <Dialog>
         <form>
            <DialogTrigger asChild>
               <Button variant="default">
                  <Icon icon="solar:add-circle-linear" className='text-xl text-white' />
                  New Sale</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
               <DialogHeader>
                  <DialogTitle>Profile Details</DialogTitle>
                  <DialogDescription>

                  </DialogDescription>
               </DialogHeader>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <Label className="uppercase">Captured By</Label>
                     <Input
                        id="captured-by"
                        name="captured_by"
                        defaultValue={user.username}
                        readOnly
                        className="mt-2"
                     />
                  </div>
                  <div>
                     <Label className="uppercase">Region</Label>
                     <Input
                        id="region"
                        name="region"
                        defaultValue={user.region_code}
                        readOnly
                        className="mt-2"
                     />
                  </div>
                  <div>
                     <Label className="uppercase">Region Code</Label>
                     <Input
                        id="region-code"
                        name="region_code"
                        defaultValue={user.region_code}
                        readOnly
                        className="mt-2"
                     />
                  </div>
                  <div>
                     <Label className="uppercase">Outlet</Label>
                     <Input
                        id="outlet"
                        name="outlet"
                        defaultValue={user.outlet}
                        readOnly
                        className="mt-2"
                     />
                  </div>
                  <div>
                     <Label className="uppercase">Outlet Code</Label>
                     <Input
                        id="outlet-code"
                        name="outlet_code"
                        defaultValue={user.outlet_code}
                        readOnly
                        className="mt-2"
                     />
                  </div>
                  <div>
                     <Label className="uppercase">Captured Date</Label>
                     <Input
                        id="captured-date"
                        name="captured_date"
                        type="date"
                        defaultValue={new Date().toISOString().split("T")[0]}
                        className="mt-2"
                     />
                  </div>

                  <div>
                     <Label className="uppercase">Captured Time</Label>
                     <Input
                        id="captured-time"
                        name="captured_time"
                        type="time"
                        defaultValue={new Date().toTimeString().split(" ")[0].substring(0, 5)}
                        className="mt-2"
                     />
                  </div>
                  <div>
                     <Label className="uppercase">Sales Date</Label>
                     <Input
                        id="sales-date"
                        name="sales_date"
                        type="date"
                        defaultValue={new Date(Date.now() - 86400000).toISOString().split("T")[0]}
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
*/