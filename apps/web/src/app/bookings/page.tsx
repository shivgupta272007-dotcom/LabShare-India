'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  Star,
  Users,
  X,
} from 'lucide-react'
import { useLanguage } from '../../context/language-context'
import { useAuth } from '../../context/auth-context'
import { Booking } from '@labshare/shared'

export default function MyBookingsPage() {
  const { locale, t } = useLanguage()
  const { client } = useAuth()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQrBooking, setSelectedQrBooking] = useState<Booking | null>(null)
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const loadBookings = () => {
    setLoading(true)
    client.bookings
      .list()
      .then(setBookings)
      .catch((err) => console.error('Failed to load bookings:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBookings()
  }, [client])

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewBooking) return
    setSubmittingReview(true)
    try {
      await client.reviews.create({
        bookingId: reviewBooking.id,
        rating,
        comment,
      })
      setReviewBooking(null)
      loadBookings()
    } finally {
      setSubmittingReview(false)
    }
  }

  const formatDisplayTime = (timeStr?: string) => {
    if (!timeStr) return ''
    if (timeStr.includes('T')) return timeStr.substring(11, 16)
    return timeStr.substring(0, 5)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300'
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300'
      case 'PENDING_MANAGER':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
      case 'DISPUTED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="container py-8 max-w-4xl flex flex-col gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {locale === 'en' ? 'My Lab Bookings' : 'मेरी प्रयोगशाला बुकिंग'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {locale === 'en'
            ? 'Track your visit schedule, retrieve check-in codes, and submit session reviews.'
            : 'अपनी लैब बुकिंग की स्थिति देखें, आगमन चेक-इन कोड प्राप्त करें, और समीक्षाएं दर्ज करें।'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-card border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-xl p-8">
          <p className="text-sm font-semibold text-muted-foreground">
            No bookings recorded yet.
          </p>
          <Link
            href="/labs"
            className="mt-3 inline-block px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow"
          >
            Find a Lab
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                      b.status
                    )}`}
                  >
                    {b.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    ID: {b.id.substring(0, 8)}
                  </span>
                </div>

                <h3 className="font-bold text-base text-foreground">
                  {b.lab?.name || 'Science Laboratory'}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{b.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {formatDisplayTime(b.startTime)} - {formatDisplayTime(b.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{b.actualHeadcount || b.headcount} Students</span>
                  </div>
                </div>

                {b.managerNote && (
                  <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded border mt-2">
                    <strong>Manager Note: </strong>
                    {b.managerNote}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0">
                {b.status === 'APPROVED' && (
                  <button
                    onClick={() => setSelectedQrBooking(b)}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Check-in Code</span>
                  </button>
                )}

                {b.status === 'COMPLETED' && !b.review && (
                  <button
                    onClick={() => setReviewBooking(b)}
                    className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 flex items-center space-x-1"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Rate Session</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR & OTP Modal */}
      {selectedQrBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-sm w-full p-6 text-center shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Day-of Arrival Check-in</h3>
              <button
                onClick={() => setSelectedQrBooking(null)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl inline-block shadow-inner mx-auto">
              <QRCodeSVG
                value={`LABSHARE-CHECKIN:${selectedQrBooking.id}:${selectedQrBooking.checkInCode || '123456'}`}
                size={180}
              />
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Or give 6-Digit OTP to Lab In-Charge:
              </div>
              <div className="text-3xl font-extrabold tracking-widest font-mono text-primary">
                {selectedQrBooking.checkInCode || '729415'}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Show this screen to the host school Lab In-Charge at the entrance.
            </p>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Rate Your Laboratory Visit</h3>
              <button
                onClick={() => setReviewBooking(null)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Comments & Student Feedback
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the lab facility, equipment, and host school coordination?"
                  className="w-full text-xs rounded-lg border bg-background px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="px-3.5 py-2 rounded-lg border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-700 shadow"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
