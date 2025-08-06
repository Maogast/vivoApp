// PendingRecordSalesView.tsx
// This component displays detailed information about a specific pending record sale.
// It allows users to return, approve, reject, or comment on the sale.
'use client'

import React, { useState, useEffect } from 'react'
import { API_AUTHORIZATION } from '@/lib/constants'
import { endpoints } from '../../lib/endpoints'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import {
  ArrowUturnLeftIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/solid'

import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '../ui/table'
import { Textarea } from '../ui/textarea'

import {
  fetchData,
  submitForApproval,
  returnBackToOpen,
  approveRequest,
  rejectRequest,
} from '@/lib/api'

import { VivoSalesHeader, SalesLine } from '@/types' // Import SalesLine and VivoSalesHeader from types

interface Props {
  No: string
  username: string // Added username to props
}

export default function PendingRecordsSalesView({ No, username }: Props) {
  const router = useRouter()

  // Dialog open state
  const [open, setOpen] = useState(false)
  const onClose = () => setOpen(false)

  // Fetched data
  const [header, setHeader] = useState<VivoSalesHeader | null>(null)
  const [lineItems, setLineItems] = useState<SalesLine[]>([]) // Changed any[] to SalesLine[]

  // UI state
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [openReturn, setOpenReturn] = useState(false)
  const [openApprove, setOpenApprove] = useState(false)
  const [openReject, setOpenReject] = useState(false)

  // For the “Comment” dialog
  const [openComment, setOpenComment] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentError, setCommentError] = useState('')

  // Fetch header + lines when dialog opens
  useEffect(() => {
    if (!No || !open) return

    const fetchAll = async () => {
      setLoading(true)
      try {
        const [hdr, lines] = await Promise.all([
          fetchData<{ value: VivoSalesHeader[] }>(
            endpoints.recordSales.headerDetails(No),
          ),
          fetchData<{ value: SalesLine[] }>(endpoints.recordSales.newSalesLines(No)), // Changed any[] to SalesLine[]
        ])
        setHeader(hdr.value?.[0] ?? null)
        setLineItems(lines.value ?? [])
      } catch (err) {
        console.error('Data fetch error:', err)
        setMessage('❌ Failed to fetch sales data.')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [No, open])

  /** Return to Open */
  async function handleConfirmReturn() {
    setLoading(true)
    setMessage('')
    try {
      await returnBackToOpen(No)
      setMessage('✅ Returned to Open successfully.')
      setOpenReturn(false)
      router.refresh()
    } catch (err) {
      console.error('ReturnBackToOpen error:', err)
      setMessage('❌ Failed to return to Open.')
    } finally {
      setLoading(false)
    }
  }

  /** Approve request */
  async function handleConfirmApprove() {
    setLoading(true)
    setMessage('')
    try {
      await approveRequest(No)
      setMessage('✅ Approved successfully.')
      setOpenApprove(false)
      router.refresh()
    } catch (err) {
      console.error('ApproveRequest error:', err)
      setMessage('❌ Approval failed.')
    } finally {
      setLoading(false)
    }
  }

  /** Reject request, sending commentText as Description */
  async function handleConfirmReject() {
    setLoading(true)
    setMessage('')

    try {
      // Use the helper function to reject the request
      const result = await rejectRequest(No)

      // show the returned SN/Code
      setMessage(`✅ Rejected: SN ${result.SN}, Code ${result.Code}.`)
      setOpenReject(false)
      router.refresh()
    } catch (err) {
      console.error('RejectRequest error:', err)
      setMessage('❌ Rejection failed.')
    } finally {
      setLoading(false)
    }
  }

  /** Submit for approval */
  const handleSubmitForApproval = async () => {
    setLoading(true)
    setMessage('')
    try {
      await submitForApproval(No)
      setMessage('✅ Submitted for approval.')
      setTimeout(() => {
        onClose()
        router.refresh()
      }, 800)
    } catch (err) {
      console.error('Approval error:', err)
      setMessage('❌ Failed to submit for approval.')
    } finally {
      setLoading(false)
    }
  }

  /** Close & reset comment dialog */
  const closeCommentDialog = () => {
    setOpenComment(false)
    setCommentText('')
    setCommentError('')
  }

  /** Submit a standalone comment (not the reject reason) */
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      setCommentError('Comment cannot be empty.')
      return
    }
    setCommentLoading(true)
    setCommentError('')
    try {
      // TODO: wire actual “post comment” API
      console.log('Submitting comment:', commentText, 'for sale No:', No)
      setMessage('✅ Comment submitted successfully.')
      closeCommentDialog()
    } catch (err) {
      console.error('Comment submission failed:', err)
      setCommentError('Failed to submit comment.')
    } finally {
      setCommentLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" onClick={() => setOpen(true)}>
          {No}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[95vw] max-h-[95vh] p-0 flex flex-col overflow-hidden">
        {message && (
          <div
            className={`p-4 ${
              message.startsWith('✅')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle>Pending Sale #{No}</DialogTitle>
          <DialogDescription>
            Review and decide to Return, Approve, Reject or Comment.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white border-b px-4 py-4 sticky top-0 z-20 flex justify-between items-start flex-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <Label className="uppercase text-xs text-gray-600">
                Sale No
              </Label>
              <Input defaultValue={No} readOnly className="mt-1" />
            </div>
            <div className="flex flex-col">
              <Label className="uppercase text-xs text-gray-600">Region</Label>
              <Input
                defaultValue={header?.Region_Name || ''}
                readOnly
                className="mt-1"
              />
            </div>
            <div className="flex flex-col">
              <Label className="uppercase text-xs text-gray-600">
                Region Code
              </Label>
              <Input
                defaultValue={header?.Region_Code || ''}
                readOnly
                className="mt-1"
              />
            </div>
            <div className="flex flex-col">
              <Label className="uppercase text-xs text-gray-600">Outlet</Label>
              <Input
                defaultValue={header?.Outlet_Name || ''}
                readOnly
                className="mt-1"
              />
            </div>
            <div className="flex flex-col">
              <Label className="uppercase text-xs text-gray-600">
                Outlet Code
              </Label>
              <Input
                defaultValue={header?.Outlet_Code || ''}
                readOnly
                className="mt-1"
              />
            </div>
            <div className="flex flex-col">
              <Label className="uppercase text-xs text-gray-600">
                Captured Date
              </Label>
              <Input
                type="date"
                defaultValue={header?.Date_Captured || ''} // Use actual captured date
                readOnly
                className="mt-1"
              />
            </div>
            <div className="flex flex-col">
              <Label className="uppercase text-xs text-gray-600">
                Captured Time
              </Label>
              <Input
                type="time"
                defaultValue={header?.Time_Captured || ''} // Use actual captured time
                readOnly
                className="mt-1"
              />
            </div>
            <div className="flex flex-col">
              <Label className="uppercase text-xs text-gray-600">
                Sales Date
              </Label>
              <Input
                type="date"
                defaultValue={header?.Sales_Date || ''} // Use actual sales date
                readOnly
                className="mt-1"
              />
            </div>
            {/* NEW: Captured By field */}
            <div className="flex flex-col">
              <Label className="uppercase text-xs text-gray-600">Captured By</Label>
              <Input
                id="captured-by"
                name="captured_by"
                defaultValue={username} // Use the passed username prop
                readOnly
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            {/* Return */}
            <Dialog open={openReturn} onOpenChange={setOpenReturn}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={loading}>
                  <ArrowUturnLeftIcon className="w-5 h-5 mr-1" />
                  Return to Open
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Return to Open?</DialogTitle>
                </DialogHeader>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setOpenReturn(false)}
                  >
                    No
                  </Button>
                  <Button onClick={handleConfirmReturn} disabled={loading}>
                    Yes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Approve */}
            <Dialog open={openApprove} onOpenChange={setOpenApprove}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 text-white hover:bg-green-600 shadow-md transition-colors" disabled={loading}>
                  <CheckIcon className="w-5 h-5 mr-1" />
                  Approve
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve Record?</DialogTitle>
                </DialogHeader>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setOpenApprove(false)}
                  >
                    No
                  </Button>
                  <Button onClick={handleConfirmApprove} disabled={loading}>
                    Yes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Reject */}
            <Dialog open={openReject} onOpenChange={setOpenReject}>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                  <XMarkIcon className="w-5 h-5 mr-1" />
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Record?</DialogTitle>
                </DialogHeader>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setOpenReject(false)}
                  >
                    No
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmReject}
                    disabled={loading}
                  >
                    Yes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Comment */}
            <Dialog open={openComment} onOpenChange={setOpenComment}>
              <DialogTrigger asChild>
                <Button variant="ghost" disabled={loading}>
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  Comment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-w-full p-6">
                <DialogHeader>
                  <DialogTitle>Add Comment for No: {No}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="flex flex-col">
                    <Label htmlFor="comment">Reason / Comment</Label>
                    <Textarea
                      id="comment"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      rows={4}
                      placeholder="Enter reason or comment"
                      disabled={commentLoading}
                    />
                    {commentError && (
                      <p className="text-destructive text-sm mt-1">
                        {commentError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={closeCommentDialog}
                    disabled={commentLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={commentLoading || !commentText.trim()}
                  >
                    {commentLoading ? 'Submitting…' : 'Submit'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 pb-16">
          <Card className="bg-transparent p-0">
            <Table>
              <TableCaption>Individual Sales Targets</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>SKU Ltrs</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>SKU Ratio</TableHead>
                  <TableHead>Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, idx) => (
                  <TableRow key={`${item.No}-${item.SN}-${idx}`}>
                    <TableCell>{item.Officer_Name}</TableCell>
                    <TableCell>{item.Role_Name}</TableCell>
                    <TableCell>{item.Product_Code}</TableCell>
                    <TableCell>{item.Target}</TableCell>
                    <TableCell>{item.SKU_Code}</TableCell>
                    <TableCell>{item.SKU_Liters}</TableCell>
                    <TableCell>{item.Grade}</TableCell>
                    <TableCell>{item.Quantity}</TableCell>
                    <TableCell>{item.Total}</TableCell>
                    <TableCell>{item.SKU_Ratio}</TableCell>
                    <TableCell>{item.Commission_Earned}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
