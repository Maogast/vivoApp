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
import { Icon } from '@iconify/react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
// Importing the new API functions and types from a single source
import {
  submitForApproval,
  fetchSalesLines,
  updateSalesLine,
  deleteSalesLine, // Renamed to apiDeleteSalesLine in RecordSalesForm to avoid conflict
  addSalesLine,
} from '@/lib/api';
// Importing types directly from '@/types'
import { SalesLine, VivoProduct, ProductSKU, VivoSalesHeader } from '@/types';
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../ui/table';


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

    const row = lineItems[idx];
    if (!row) {
      setToast({ type: 'error', message: `Error: Row not found for update.` });
      setLineItems((rows) =>
        rows.map((r, i) => (i === idx ? { ...r, isUpdating: false } : r))
      );
      return;
    }

    // If the line is newly added and still has a temporary string SN,
    // update local state only and prevent API call.
    if (typeof row.SN === 'string' && row.SN.startsWith('temp-')) {
        setLineItems(rows => rows.map((r, i) =>
            i === idx ? { ...r, ...updatedFields, isUpdating: false } : r
        ));
        setToast({ type: 'success', message: `${field} updated (local only)` });
        return; // Exit early, no API call needed yet
    }


    // Set updating flag for the specific row
    setLineItems((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, isUpdating: true } : r))
    );

    // Construct the API payload carefully.
    // Only include properties that are explicitly defined in updatedFields
    // AND are expected by the backend's RawVivoSalesLine for patching.
    const apiPayload: Partial<SalesLine> = {};

    if (updatedFields.Product_Code !== undefined) {
      apiPayload.Product_Code = updatedFields.Product_Code;
    }
    if (updatedFields.SKU_Code !== undefined) {
      apiPayload.SKU_Code = updatedFields.SKU_Code;
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
      // Cast SN to number here, as updateSalesLine expects a number for a persisted line
      const updated = await updateSalesLine(
        row.No,
        row.SN as number, // Cast SN to number as it's guaranteed to be number here
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

    // If SN is a temporary string, it means the line hasn't been saved yet.
    // Just remove it from the local state.
    if (typeof itemToDelete.SN === 'string' && itemToDelete.SN.startsWith('temp-')) {
        setToast({ type: 'success', message: 'Unsaved line removed from list.' });
        setLineItems(rows => rows.filter((_, i) => i !== idx));
        return;
    }

    setLineItems((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, isUpdating: true } : r))
    );

    try {
      await deleteSalesLine(
        itemToDelete.No,
        itemToDelete.SN as number, // Cast SN to number for API call
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

    const currentRow = lineItems[idx];
    if (!currentRow) {
        setToast({ type: 'error', message: 'Cannot add line: Missing context.' });
        return;
    }

    // Temporarily mark the current row as updating and add a placeholder for the new line
    setLineItems(rows => {
        const updatedRows = [...rows];
        updatedRows[idx] = { ...updatedRows[idx], isUpdating: true };
        updatedRows.splice(idx + 1, 0, {
            No: currentRow.No,
            SN: `temp-creating-${crypto.randomUUID()}`, // Temporary ID for UI rendering
            Officer_Code: currentRow.Officer_Code,
            Product_Code: currentRow.Product_Code || '',
            Officer_Name: currentRow.Officer_Name,
            Role_Name: currentRow.Role_Name,
            Target: 0,
            SKU_Code: '',
            SKU_Liters: 0,
            Grade: '',
            Quantity: 0,
            Total: 0,
            SKU_Ratio: 0,
            Commission_Earned: 0,
            '@odata.etag': '',
            isUpdating: true, // This new line is also 'updating' while being created
            SKU_Name: '', // Fix: Initialize SKU_Name as it's required by SalesLine
        });
        return updatedRows;
    });

    try {
      const officerCode = currentRow.Officer_Code || '';
      const productCode = currentRow.Product_Code || '';

      const newLine = await addSalesLine(No, officerCode, productCode);

      setLineItems(rows => {
        // Find the temporary placeholder and replace it with the actual new line data
        const finalRows = rows.map(r => {
            if (typeof r.SN === 'string' && r.SN.startsWith('temp-creating-')) {
                // Map the API response to the SalesLine type, ensuring correct SN and numeric defaults
                return {
                    ...newLine,
                    SN: newLine.SN || `temp-${crypto.randomUUID()}`, // Use API SN or fallback to new temp
                    SKU_Liters: newLine.SKU_Liters ?? 0,
                    Quantity: newLine.Quantity ?? 0,
                    Total: newLine.Total ?? 0,
                    SKU_Ratio: newLine.SKU_Ratio ?? 0,
                    Commission_Earned: newLine.Commission_Earned ?? 0,
                    Target: newLine.Target ?? 0,
                    isUpdating: false
                };
            }
            // Ensure the original row (if it was set to updating) is reset
            if (r.No === currentRow.No && r.SN === currentRow.SN) {
                return { ...r, isUpdating: false };
            }
            return r;
        }).filter(Boolean) as SalesLine[]; // Filter out any old temp placeholders if map didn't replace them

        // Ensure no duplicates by checking if the new line is already there
        const isNewLineAlreadyPresent = finalRows.some(item => item.No === newLine.No && item.SN === newLine.SN);
        if (!isNewLineAlreadyPresent && newLine.SN !== `temp-${crypto.randomUUID()}`) { // Prevent adding if it's already properly handled or still a generic temp
            finalRows.push({
                ...newLine,
                SN: newLine.SN || `temp-${crypto.randomUUID()}`,
                SKU_Liters: newLine.SKU_Liters ?? 0,
                Quantity: newLine.Quantity ?? 0,
                Total: newLine.Total ?? 0,
                SKU_Ratio: newLine.SKU_Ratio ?? 0,
                Commission_Earned: newLine.Commission_Earned ?? 0,
                Target: newLine.Target ?? 0,
                isUpdating: false
            });
        }
        return finalRows;
      });
      setToast({ type: 'success', message: 'New sales line added.' });
    } catch (err: any) {
      console.error('API Add Line Error:', err);
      // Revert updating state and remove any temporary placeholders on error
      setLineItems(rows =>
        rows.map(r => {
            if (r.No === currentRow.No && r.SN === currentRow.SN) {
                return { ...r, isUpdating: false };
            }
            if (typeof r.SN === 'string' && r.SN.startsWith('temp-creating-')) {
                return null; // Mark for removal
            }
            return r;
        }).filter(Boolean) as SalesLine[] // Filter out nulls
      );
      setToast({ type: 'error', message: `Failed to add new sales line: ${err.message || 'Unknown error'}` });
    }
  }

  // Load line items when dialog opens or No changes
  useEffect(() => {
    if (!No || !isOpen) return;
    fetchSalesLines(No)
      .then((d) => {
        // Ensure each fetched item has a unique SN (number or temp string) for React's key prop
        const processedData = d.map((item, index) => ({
          ...item,
          // If SN from API is 0 or undefined, assign a unique temporary string.
          // Otherwise, use the API's SN (which should be a number).
          SN: (item.SN === undefined || item.SN === null || item.SN === 0)
            ? `temp-${crypto.randomUUID()}` // Assign a unique temporary string ID
            : Number(item.SN), // Ensure it's a number if it came from API
          SKU_Liters: item.SKU_Liters ?? 0, // Ensure numeric defaults
          Quantity: item.Quantity ?? 0,
          Total: item.Total ?? 0,
          SKU_Ratio: item.SKU_Ratio ?? 0,
          Commission_Earned: item.Commission_Earned ?? 0,
          Target: item.Target ?? 0,
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
    // Check if there's at least one line with Quantity > 0 and no unsaved (temp) lines
    const hasValidLines = lineItems.some(item => item.Quantity > 0 && typeof item.SN === 'number');
    const hasUnsavedLines = lineItems.some(item => typeof item.SN === 'string' && item.SN.startsWith('temp-'));

    if (hasUnsavedLines) {
        setToast({ type: 'error', message: 'Please save all newly added lines before sending for approval.' });
        return;
    }

    if (!hasValidLines) {
      setToast({
        type: 'error',
        message: 'Add at least one line with Qty > 0 before sending.',
      });
      return;
    }

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
                      key={`${item.No}-${item.SN}`}
                      className="even:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        {item.Officer_Name}
                      </TableCell>
                      <TableCell>{item.Role_Name}</TableCell>
                      <TableCell>
                        <select
                          className="w-full border rounded px-2 py-1"
                          disabled={item.isUpdating || !isEditable}
                          value={item.Product_Code ?? ''}
                          onChange={e =>
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
                          disabled={item.isUpdating || !isEditable}
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
                          disabled={item.isUpdating || !isEditable}
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
