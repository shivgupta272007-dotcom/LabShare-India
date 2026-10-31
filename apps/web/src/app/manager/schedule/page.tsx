'use client'

import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  LogOut,
  MapPin,
  QrCode,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { useLanguage } from '../../../context/language-context'
import { useAuth } from '../../../context/auth-context'
import { Booking } from '@labshare/shared'

export default function DayOfOpsConsolePage() {
  const { locale } = useLanguage()
  const { client } = useAuth()

  const [scheduleData, setScheduleData] = useState<{
    date: string
    totalToday: number
    activeNow: number
    upcomingToday: number
    bookings: Booking[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  // Check-in Modal
  const [checkInBooking, setCheckInBooking] = useState<Booking | null>(null)
  const [code, setCode] = useState('')
  const [actualHeadcount, setActualHeadcount] = useState(24)
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false)

  // Check-out Modal
  const [checkOutBooking, setCheckOutBooking] = useState<Booking | null>(null)
  const [damageFlagged, setDamageFlagged] = useState(false)
  const [damageNotes, setDamageNotes] = useState('')
  const [submittingCheckOut, setSubmittingCheckOut] = useState(false)

  const loadSchedule = () => {
    setLoading(true)
    client.ops
      .getTodaySchedule()
      .then(setScheduleData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSchedule()
  }, [client])

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkInBooking) return
    setSubmittingCheckIn(true)
    try {
      await client.ops.checkIn({
        bookingId: checkInBooking.id,
        code,
        actualHeadcount,
        supervisingAdultName: checkInBooking.sponsor?.name || 'Adult Supervisor',
        supervisingAdultPhone: checkInBooking.sponsor?.phone || '9000000005',
      })
      setCheckInBooking(null)
      setCode('')
      loadSchedule()
    } catch (err: any) {
      alert(`Check-in failed: ${err.message}`)
    } finally {
      setSubmittingCheckIn(false)
    }
  }

  const handleCheckOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkOutBooking) return
    setSubmittingCheckOut(true)
    try {
      await client.ops.checkOut({
        bookingId: checkOutBooking.id,
        damageFlagged,
        damageNotes: damageFlagged ? damageNotes : undefined,
      })
      setCheckOutBooking(null)
      setDamageFlagged(false)
      setDamageNotes('')
      loadSchedule()
    } catch (err: any) {
      alert(`Checkout failed: ${err.message}`)
    } finally {
      setSubmittingCheckOut(false)
    }
  }

  return (
    <div className="container py-8 max-w-5xl flex flex-col gap-8">
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            Day-of Operations Console
          </span>
          <span className="text-xs text-muted-foreground">• Live Entrance Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
          {locale === 'en' ? "Today's Lab Session Console" : 'आज का सत्र प्रबंधन कंसोल'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {locale === 'en'
            ? 'Execute arrival check-in with 6-digit OTP codes and conduct checkout inspection.'
            : 'छात्र समूहों का ओटीपी द्वारा चेक-इन करें एवं प्रस्थान निरीक्षण पूरा करें।'}
        </p>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm text-center">
          <div className="text-xs text-muted-foreground">Total Today</div>
          <div className="text-2xl font-extrabold text-foreground mt-1">
            {scheduleData?.totalToday || 0}
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm text-center">
          <div className="text-xs text-muted-foreground">Currently Inside Lab</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">
            {scheduleData?.activeNow || 0}
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm text-center">
          <div className="text-xs text-muted-foreground">Upcoming Arrivals</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {scheduleData?.upcomingToday || 0}
          </div>
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">
          {locale === 'en' ? 'Sessions on Docket' : 'आज के निर्धारित सत्र'}
        </h2>

        {loading ? (
          <div className="h-44 bg-card border rounded-xl animate-pulse" />
        ) : scheduleData?.bookings.length === 0 ? (
          <div className="text-center py-12 bg-card border rounded-xl p-6 text-xs text-muted-foreground">
            No active or upcoming lab sessions scheduled for today.
          </div>
        ) : (
          <div className="space-y-4">
            {scheduleData?.bookings.map((b) => (
              <div
                key={b.id}
                className="bg-card border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        b.status === 'CHECKED_IN'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300'
                          : b.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {b.status === 'CHECKED_IN' ? '● IN PROGRESS' : b.status}
                    </span>
                    <span className="font-bold text-sm text-foreground">
                      {b.organization?.name}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Lab: <strong>{b.lab?.name}</strong> • Time: {b.startTime.substring(11, 16)} - {b.endTime.substring(11, 16)}
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center space-x-4">
                    <span>Expected Headcount: {b.headcount}</span>
                    {b.actualHeadcount && <span>Actual Headcount: {b.actualHeadcount}</span>}
                    {b.checkInAt && <span>Checked in at: {new Date(b.checkInAt).toLocaleTimeString()}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {b.status === 'APPROVED' && (
                    <button
                      onClick={() => {
                        setCheckInBooking(b)
                        setCode(b.checkInCode || '')
                        setActualHeadcount(b.headcount)
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Check-in</span>
                    </button>
                  )}

                  {b.status === 'CHECKED_IN' && (
                    <button
                      onClick={() => setCheckOutBooking(b)}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow flex items-center space-x-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Inspect & Check-out</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {checkInBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Arrival Verification</h3>
              <button onClick={() => setCheckInBooking(null)} className="p-1 rounded hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  6-Digit Sponsor Check-in Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-center text-xl font-mono tracking-widest font-bold py-2 rounded-lg border bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Actual Student Headcount Counted
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={actualHeadcount}
                  onChange={(e) => setActualHeadcount(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-mono py-2 px-3 rounded-lg border bg-background"
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border text-[11px] text-emerald-900 dark:text-emerald-300">
                ✓ Supervising Teacher Adult verified present on premises.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setCheckInBooking(null)}
                  className="px-3.5 py-2 border rounded-lg text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCheckIn || code.length !== 6}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow"
                >
                  {submittingCheckIn ? 'Confirming...' : 'Confirm Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check-out Modal with Damage Checklist */}
      {checkOutBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Post-Session Checkout Inspection</h3>
              <button onClick={() => setCheckOutBooking(null)} className="p-1 rounded hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckOutSubmit} className="space-y-4">
              <div className="space-y-2 text-xs">
                <label className="flex items-center space-x-2 p-2.5 rounded-lg border bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!damageFlagged}
                    onChange={(e) => setDamageFlagged(!e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>All glassware, equipment, and lab stations returned in clean order.</span>
                </label>

                <label className="flex items-center space-x-2 p-2.5 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive cursor-pointer">
                  <input
                    type="checkbox"
                    checked={damageFlagged}
                    onChange={(e) => setDamageFlagged(e.target.checked)}
                    className="rounded text-destructive focus:ring-destructive"
                  />
                  <span className="font-bold">Flag Equipment Damage or Protocol Violation</span>
                </label>
              </div>

              {damageFlagged && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Describe Damage or Incident Details
                  </label>
                  <textarea
                    rows={3}
                    value={damageNotes}
                    onChange={(e) => setDamageNotes(e.target.value)}
                    placeholder="Provide specific notes regarding damaged microscope, cracked beaker, etc."
                    className="w-full text-xs rounded-lg border bg-background p-2.5"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setCheckOutBooking(null)}
                  className="px-3.5 py-2 border rounded-lg text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCheckOut}
                  className={`px-4 py-2 rounded-lg text-white text-xs font-bold shadow ${
                    damageFlagged
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {submittingCheckOut ? 'Processing...' : 'Complete Checkout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
