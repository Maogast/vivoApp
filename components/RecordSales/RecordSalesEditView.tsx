// components/RecordSales/RecordSalesEditView.tsx
// This component is responsible for displaying and managing the sales records form.
// It now receives 'products' and 'SKU' as props from its parent component.
'use client';

import React, { useEffect, useState, FormEvent, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../ui/table';
// Importing the new API functions and types from a single source
import {
  submitForApproval,
  fetchSalesLines,
  updateSalesLine,
  deleteSalesLine,
  addSalesLine,
} from '@/lib/api';
// Importing types directly from '@/types'
import { SalesLine, VivoProduct, ProductSKU, VivoSalesHeader } from '@/types';

type Toast = {
  type: 'success' | 'error';
  message: string;
};

interface RecordSalesEditViewProps {
  No: string;
  header: VivoSalesHeader;
  onClose: () => void;
  isOpen: boolean; // Added isOpen prop to control dialog visibility
  products: VivoProduct[]; // Now receives products as a prop
  SKU: ProductSKU[]; // Now receives SKU as a prop
  isEditable?: boolean; // New prop to control editability of line items
}

export default function RecordSalesEditView({
  No,
  header,
  onClose,
  isOpen,
  products, // Destructure from props
  SKU, // Destructure from props
  isEditable = false, // Default to false as per request
}: RecordSalesEditViewProps) {
  const [lineItems, setLineItems] = useState<SalesLine[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  /**
   * Memoized SKU list. For a datalist, we typically provide all available options,
   * and the browser handles the filtering based on the input.
   */
  const filteredSKUs = useMemo(() => {
    return SKU;
  }, [SKU]); // Now depends on SKU prop

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  /**
   * Patches a sales line via the API.
   * This function now explicitly constructs the payload to send ONLY the
   * relevant, defined fields to the API, avoiding serialization errors.
   * @param idx The index of the line item to update.
   * @param updatedFields A partial object containing ONLY the fields to be updated.
   * @param field A descriptive name of the field being updated for toast messages.
   */
  async function handlePatch(
    idx: number,
    updatedFields: Partial<SalesLine>, // This now contains only the specific field being updated
    field: string
  ) {
    // If not editable, do nothing
    if (!isEditable) return;

    // Set updating flag for the specific row
    setLineItems((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, isUpdating: true } : r))
    );

    const row = lineItems[idx];
    if (!row) {
      setToast({ type: 'error', message: `Error: Row not found for update.` });
      setLineItems((rows) =>
        rows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      );
      return;
    }

    // Construct the API payload carefully.
    // Only include properties that are explicitly defined in updatedFields
    // AND are expected by the backend's RawVivoSalesLine for patching.
    const apiPayload: Partial<SalesLine> = {};

    if (updatedFields.Product_Code !== undefined) {
      apiPayload.Product_Code = updatedFields.Product_Code;
    }
    if (updatedFields.SKU_Code !== undefined) {
      apiPayload.SKU_Code = updatedFields.SKU_Code; // Corrected typo: SKu_Code to SKU_Code
    }
    if (updatedFields.Quantity !== undefined) {
      apiPayload.Quantity = updatedFields.Quantity;
    }
    if (updatedFields.SKU_Liters !== undefined) {
        apiPayload.SKU_Liters = updatedFields.SKU_Liters;
    }
    if (updatedFields.Grade !== undefined) {
        apiPayload.Grade = updatedFields.Grade;
    }
    if (updatedFields.Commission_Earned !== undefined) {
        apiPayload.Commission_Earned = updatedFields.Commission_Earned;
    }
    if (updatedFields.SKU_Name !== undefined) {
        apiPayload.SKU_Name = updatedFields.SKU_Name;
    }
    if (updatedFields.Total !== undefined) {
        apiPayload.Total = updatedFields.Total;
    }
    if (updatedFields.SKU_Ratio !== undefined) {
        apiPayload.SKU_Ratio = updatedFields.SKU_Ratio;
    }
    if (updatedFields.Officer_Code !== undefined) {
        apiPayload.Officer_Code = updatedFields.Officer_Code;
    }
    if (updatedFields.Officer_Name !== undefined) {
        apiPayload.Officer_Name = updatedFields.Officer_Name;
    }
    if (updatedFields.Role_Name !== undefined) {
        apiPayload.Role_Name = updatedFields.Role_Name;
    }
    if (updatedFields.Target !== undefined) {
        apiPayload.Target = updatedFields.Target;
    }

    if (Object.keys(apiPayload).length === 0) {
      setToast({ type: 'error', message: `No valid fields to update for ${field}.` });
      setLineItems((rows) =>
        rows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      );
      return;
    }

    try {
      const updated = await updateSalesLine(
        row.No,
        row.SN,
        apiPayload,
        row['@odata.etag']
      );

      setLineItems((rows) =>
        rows.map((r, i) =>
          i === idx
            ? {
                ...r,
                ...updated,
                '@odata.etag': updated['@odata.etag'],
                isUpdating: false,
              }
            : r
        )
      );
      setToast({ type: 'success', message: `${field} updated` });
    } catch (err: any) {
      console.error('API Patch Error:', err);
      setLineItems((rows) =>
        rows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      );
      setToast({ type: 'error', message: `Failed to update ${field}: ${err.message || 'Unknown error'}` });
    }
  }

  // Field-specific handlers call handlePatch with only the relevant field
  const handleProductChange = (i: number, code: string) =>
    handlePatch(i, { Product_Code: code }, 'Product');

  /**
   * Handles changes to the SKU input field.
   * If a valid SKU Code (from datalist selection) is entered, it updates the SKU_Code.
   * If the input is cleared, it sets SKU_Code to undefined, allowing re-selection.
   * If an invalid SKU is typed, it clears the SKU_Code and shows an error.
   * @param idx The index of the line item.
   * @param inputCode The SKU_Code (or empty string if cleared) from the input.
   */
  const handleSKUChange = (idx: number, inputCode: string) => {
    // If not editable, do nothing
    if (!isEditable) return;

    if (inputCode === '') {
      handlePatch(idx, { SKU_Code: undefined }, 'SKU');
      return;
    }

    const matchedSKU = SKU.find((s) => s.SKU_Code === inputCode);

    if (matchedSKU) {
      handlePatch(idx, { SKU_Code: matchedSKU.SKU_Code }, 'SKU');
    } else {
      console.warn(`Invalid SKU entered for line ${idx}: ${inputCode}. Clearing SKU.`);
      handlePatch(idx, { SKU_Code: undefined }, 'SKU');
      setToast({ type: 'error', message: `Invalid SKU: '${inputCode}'. Please select from the list.` });
    }
  };

  const handleQuantityChange = (i: number, qty: number) => {
    // If not editable, do nothing
    if (!isEditable) return;
    handlePatch(i, { Quantity: qty }, 'Quantity');
  }

  /**
   * Deletes a sales line from the API and updates the local state.
   * Uses the new deleteSalesLine API function.
   * @param idx The index of the line item to delete.
   */
  async function handleDeleteLine(idx: number) {
    // If not editable, do nothing
    if (!isEditable) return;

    const itemToDelete = lineItems[idx];
    if (!itemToDelete) return;

    setLineItems((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, isUpdating: true } : r))
    );

    try {
      await deleteSalesLine(
        itemToDelete.No,
        itemToDelete.SN,
        itemToDelete['@odata.etag']
      );

      setLineItems((rows) => rows.filter((_, i) => i !== idx));
      setToast({ type: 'success', message: 'Sales line deleted successfully.' });
    } catch (err: any) {
      console.error('API Delete Error:', err);
      setLineItems((rows) =>
        rows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      );
      setToast({ type: 'error', message: `Failed to delete sales line: ${err.message || 'Unknown error'}` });
    }
  }

  /**
   * Adds a new, empty sales line via the API and inserts it below the specified index.
   * Uses the new addSalesLine API function.
   */
  async function handleAddEmptyLineAfter(idx: number) {
    // If not editable, do nothing
    if (!isEditable) return;

    const row = lineItems[idx];
    if (!row) return;

    setLineItems((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, isUpdating: true } : r))
    );

    try {
      const officerCode = row.Officer_Code || '';
      const productCode = row.Product_Code || '';

      const newLine = await addSalesLine(No, officerCode, productCode);

      setLineItems((rows) => {
        const newRows = [...rows];
        
        // Ensure SN is a unique number for React keys
        const effectiveSN = (newLine.SN === undefined || newLine.SN === null || newLine.SN === 0)
            ? -(Date.now() + Math.random())
            : newLine.SN;

        const finalNewLine: SalesLine = {
          ...newLine,
          SN: effectiveSN,
          isUpdating: false
        };
        newRows.splice(idx + 1, 0, finalNewLine);
        return newRows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r));
      });
      setToast({ type: 'success', message: 'New sales line added.' });
    } catch (err: any) {
      console.error('API Add Line Error:', err);
      setLineItems((rows) =>
        rows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      );
      setToast({ type: 'error', message: `Failed to add new sales line: ${err.message || 'Unknown error'}` });
    }
  }

  // Load line items when dialog opens or No changes
  useEffect(() => {
    if (!No || !isOpen) return;
    fetchSalesLines(No)
      .then((d) => {
        // Ensure each fetched item has a unique numeric SN for React keys
        const processedData = d.map((item, index) => ({
          ...item,
          SN: (item.SN === undefined || item.SN === null || item.SN === 0)
            ? -(Date.now() + index + Math.random()) // Use index to help with uniqueness if multiple are undefined at once
            : item.SN,
        }));
        setLineItems(processedData);
      })
      .catch((err) => {
        console.error('Failed to fetch sales lines:', err);
        setToast({ type: 'error', message: `Failed to load sales lines: ${err.message || 'Unknown error'}` });
      });
  }, [No, isOpen]);

  // Prevent form submit on Enter
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  // Send for approval
  const handleSendForApproval = async () => {
    setIsApproving(true);
    setToast(null);

    try {
      await submitForApproval(No);
      setToast({ type: 'success', message: 'Sent for approval' });

      setTimeout(onClose, 3000);
    } catch (err: any) {
      console.error('API Approval Error:', err);
      setToast({ type: 'error', message: err.message || 'Approval failed' });
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[99] p-4 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 ease-in-out transform
          ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          ${toast.type === 'success' ? 'animate-fade-in-down' : 'animate-fade-in-down'}`}
        >
          <Icon
            icon={toast.type === 'success' ? 'tabler:circle-check-filled' : 'tabler:circle-x-filled'}
            className="text-xl"
          />
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <DialogContent className="sm:max-w-8xl max-h-[98vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Sale No: {No}</DialogTitle>
            <DialogDescription>
              Review or adjust line items, then send for approval.
            </DialogDescription>
          </DialogHeader>

          {/* Header info + Actions */}
          <div className="bg-white border-b px-4 py-4 sticky top-[3.5rem] z-20 flex justify-between">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="uppercase">Sale No</Label>
                <Input readOnly defaultValue={No} className="mt-2" />
              </div>
              <div>
                <Label className="uppercase">Region</Label>
                <Input
                  readOnly
                  defaultValue={header.Region_Name}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="uppercase">Region Code</Label>
                <Input
                  readOnly
                  defaultValue={header.Region_Code}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="uppercase">Outlet</Label>
                <Input
                  readOnly
                  defaultValue={header.Outlet_Name}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="uppercase">Outlet Code</Label>
                <Input
                  readOnly
                  defaultValue={header.Outlet_Code}
                  className="mt-2"
                />
              </div>
               {/* Display other header properties */}
              <div>
                <Label className="uppercase">Sales Date</Label>
                <Input
                  readOnly
                  defaultValue={header.Sales_Date}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="uppercase">Status</Label>
                <Input
                  readOnly
                  defaultValue={header.Status}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="uppercase">Total Target</Label>
                <Input
                  readOnly
                  defaultValue={header.Total_Target?.toFixed(2) || '0.00'}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="uppercase">Total Achieved</Label>
                <Input
                  readOnly
                  defaultValue={header.Total_Achieved?.toFixed(2) || '0.00'}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="uppercase">Total Commission</Label>
                <Input
                  readOnly
                  defaultValue={header.Total_Commission_Earned?.toFixed(2) || '0.00'}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendForApproval}
                disabled={isApproving}
              >
                {isApproving ? 'Sending…' : 'Send for Approval'}
              </Button>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="flex-1 overflow-y-auto overflow-x-auto px-4 py-2">
            <Card className="bg-transparent p-4">
              <Table className="w-full">
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
                    <TableHead>SKU Ratio</TableHead>
                    <TableHead>Commission Earned</TableHead>
                    {isEditable && <TableHead className="text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, idx) => (
                    <TableRow
                      key={`${item.No}-${item.SN}`} // SN is now guaranteed to be unique and numeric
                      className="even:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        {item.Officer_Name}
                      </TableCell>
                      <TableCell>{item.Role_Name}</TableCell>
                      <TableCell>
                        <select
                          className="w-full border rounded px-2 py-1"
                          disabled={item.isUpdating || !isEditable} // Disable if not editable
                          value={item.Product_Code ?? ''}
                          onChange={(e) =>
                            handleProductChange(idx, e.target.value)
                          }
                        >
                          <option value="">Select Product</option>
                          {products.map((p) => (
                            <option key={p.Code} value={p.Code}>
                              {p.Description}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">{(item.Target ?? 0).toFixed(2)}</p>
                      </TableCell>
                      <TableCell>
                        <Input
                          list={`sku-options-${idx}`}
                          className="w-full border rounded px-2 py-1"
                          disabled={item.isUpdating || !isEditable} // Disable if not editable
                          value={item.SKU_Code ?? ''}
                          onChange={(e) => handleSKUChange(idx, e.target.value)}
                          placeholder="Search SKU"
                        />
                        <datalist id={`sku-options-${idx}`}>
                          {filteredSKUs.map((s) => (
                            <option key={s.SKU_Code} value={s.SKU_Code}>
                              {s.SKU_Name}
                            </option>
                          ))}
                        </datalist>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">
                          {(item.SKU_Liters ?? 0).toFixed(3)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">{item.Grade}</p>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-[80px] text-right"
                          disabled={item.isUpdating || !isEditable} // Disable if not editable
                          value={item.Quantity}
                          onChange={(e) =>
                            handleQuantityChange(idx, Number(e.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <p className="text-right">
                          {(item.Total ?? 0).toFixed(3)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">
                          {(item.SKU_Ratio ?? 0).toFixed(3)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-right">
                          {(item.Commission_Earned ?? 0).toFixed(2)}
                        </p>
                      </TableCell>
                      {isEditable && ( // Conditionally render actions
                        <TableCell className="text-center">
                          {item.isUpdating ? (
                            <Icon
                              icon="solar:spinner-loop-bold"
                              className="animate-spin text-xl"
                            />
                          ) : (
                            <div className="flex justify-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddEmptyLineAfter(idx)}
                                disabled={isApproving || !isEditable}
                              >
                                +
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteLine(idx)}
                                disabled={isApproving || !isEditable}
                              >
                                ×
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
