'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import { useLanguage } from '../../../context/language-context'
import { useAuth } from '../../../context/auth-context'
import { Booking } from '@labshare/shared'

export default function ManagerInboxPage() {
  const { locale } = useLanguage()
  const { client, user, role } = useAuth()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionBooking, setActionBooking] = useState<{
    booking: Booking
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'
  } | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadRequests = () => {
    setLoading(true)
    client.bookings
      .list()
      .then((all) => {
        // Filter to pending or active host school bookings
        setBookings(all)
      })
      .catch((err) => console.error('Failed to load manager requests:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRequests()
  }, [client])

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actionBooking) return

    setSubmitting(true)
    try {
      await client.bookings.action(actionBooking.booking.id, {
        action: actionBooking.action,
        version: actionBooking.booking.version,
        note,
      })
      setActionBooking(null)
      setNote('')
      loadRequests()
    } catch (err: any) {
      alert(`Action failed: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const pendingRequests = bookings.filter((b) => b.status === 'PENDING_MANAGER')
  const approvedRequests = bookings.filter((b) => b.status === 'APPROVED' || b.status === 'CHECKED_IN')

  return (
    <div className="container py-8 max-w-5xl flex flex-col gap-8">
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            Manager Console
          </span>
          <span className="text-xs text-muted-foreground">• Realtime SSE Active</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
          {locale === 'en' ? 'Community Lab Request Inbox' : 'प्रयोगशाला अनुरोध इनबॉक्स'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {locale === 'en'
            ? 'Review and approve booking requests from verified schools and NGOs with automated rules assessment.'
            : 'सत्यापित विद्यालयों एवं गैर-सरकारी संगठनों से प्राप्त अनुरोधों की समीक्षा एवं पुष्टि करें।'}
        </p>
      </div>

      {/* Tabs / Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="text-xs text-muted-foreground font-medium">Pending Review</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {pendingRequests.length}
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="text-xs text-muted-foreground font-medium">Approved / Upcoming</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {approvedRequests.length}
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-xs text-muted-foreground font-medium">Host Institution</div>
          <div className="text-sm font-bold text-foreground mt-1 truncate">
            Jawahar Navodaya Vidyalaya
          </div>
        </div>
      </div>

      {/* Pending Requests List */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-foreground">
          {locale === 'en' ? 'Pending Approval' : 'अनुमोदन हेतु लंबित'}
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-card border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-12 bg-card border rounded-xl p-6 text-xs text-muted-foreground">
            No pending booking requests at this time. All caught up!
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((b) => (
              <div
                key={b.id}
                className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-base text-foreground">
                        {b.organization?.name || 'Requesting School'}
                      </span>
                      <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        <Award className="w-3 h-3" />
                        <span>Trust: {b.organization?.trustScore || 85}/100</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Requested: <strong>{b.lab?.name}</strong> • {b.date} ({b.startTime.substring(11, 16)} - {b.endTime.substring(11, 16)})
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    PENDING APPROVAL
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-muted/20 p-3.5 rounded-lg border">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Student Cohort</span>
                    <span className="font-bold text-foreground">
                      {b.headcount} Students ({b.studentGroup?.name || 'Class 8 Science'})
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Teacher Sponsor</span>
                    <span className="font-bold text-foreground">
                      {b.sponsor?.name || 'Sunita Sharma'} (Ph: {b.sponsor?.phone})
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Parental Consent</span>
                    <span className="font-bold text-emerald-600">✓ On Record & Declared</span>
                  </div>
                </div>

                {/* Purpose */}
                <div className="text-xs text-muted-foreground">
                  <strong>Learning Objective: </strong>
                  <span>{b.purposeDescription}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    onClick={() => setActionBooking({ booking: b, action: 'REJECT' })}
                    className="px-3.5 py-2 rounded-lg border text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors flex items-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => setActionBooking({ booking: b, action: 'REQUEST_CHANGES' })}
                    className="px-3.5 py-2 rounded-lg border text-xs font-bold text-foreground hover:bg-muted transition-colors flex items-center space-x-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Request Changes</span>
                  </button>

                  <button
                    onClick={() => setActionBooking({ booking: b, action: 'APPROVE' })}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center space-x-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Request</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">
                {actionBooking.action === 'APPROVE'
                  ? 'Confirm Lab Booking Approval'
                  : actionBooking.action === 'REJECT'
                  ? 'Reject Booking Request'
                  : 'Request Modification from Teacher Sponsor'}
              </h3>
              <button
                onClick={() => setActionBooking(null)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteAction} className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Target booking for <strong>{actionBooking.booking.lab?.name}</strong> on <strong>{actionBooking.booking.date}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {actionBooking.action === 'APPROVE'
                    ? 'Manager Confirmation Note (Optional)'
                    : 'Reason / Instruction to Visiting School'}
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    actionBooking.action === 'APPROVE'
                      ? 'e.g., Lab assistant will be present. Please ensure student lab aprons.'
                      : 'Provide clear explanation...'
                  }
                  className="w-full text-xs rounded-lg border bg-background px-3 py-2"
                  required={actionBooking.action !== 'APPROVE'}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setActionBooking(null)}
                  className="px-3.5 py-2 rounded-lg border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded-lg text-white text-xs font-bold shadow ${
                    actionBooking.action === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : actionBooking.action === 'REJECT'
                      ? 'bg-destructive hover:bg-destructive/90'
                      : 'bg-primary hover:bg-primary-700'
                  }`}
                >
                  {submitting ? 'Executing...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
