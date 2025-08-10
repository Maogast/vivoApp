
import React from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { getUserData } from '@/lib/get-user';
import { Card } from '../ui/card';

export default async function VivoUserDetails() {
  const user = await getUserData();
  if (!user) {
    return (
      <div className="text-red-500">
        User not found. Please log in.
      </div>
    );
  }
  return (
      <Card className="mt-4 bg-transparent p-4">
      <div>
        <h2 className='text-xl font-medium mb-4'>Profile Details</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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

    </Card>
  )
}
