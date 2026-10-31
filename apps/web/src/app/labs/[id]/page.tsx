'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Building,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Info,
  MapPin,
  Microscope,
  ShieldAlert,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import { useLanguage } from '../../../context/language-context'
import { useAuth } from '../../../context/auth-context'
import { AvailabilitySlot, Lab } from '@labshare/shared'

export default function LabDetailPage() {
  const params = useParams()
  const labId = params.id as string

  const { locale, t } = useLanguage()
  const { client } = useAuth()

  const [lab, setLab] = useState<Lab | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-06')
  const [availability, setAvailability] = useState<{
    slots: AvailabilitySlot[]
    isBlackout: boolean
    blackoutReason?: string
  } | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.labs
      .getById(labId)
      .then(setLab)
      .catch((err) => console.error('Failed to load lab:', err))
      .finally(() => setLoading(false))

    client.labs
      .getReviews(labId)
      .then(setReviews)
      .catch(() => {})
  }, [client, labId])

  useEffect(() => {
    if (selectedDate) {
      client.labs
        .getAvailability(labId, selectedDate)
        .then(setAvailability)
        .catch(() => {})
    }
  }, [client, labId, selectedDate])

  if (loading) {
    return (
      <div className="container py-12 text-center animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
        <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-8"></div>
      </div>
    )
  }

  if (!lab) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-xl font-bold">Lab not found</h1>
      </div>
    )
  }

  const rules = lab.currentRules

  return (
    <div className="container py-8 max-w-5xl flex flex-col gap-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Link href="/labs" className="hover:text-primary">
          Labs
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{lab.name}</span>
      </div>

      {/* Main Header Banner */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-2">
              <Microscope className="w-3.5 h-3.5" />
              <span>{lab.type.replace('_', ' ')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{lab.name}</h1>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1 text-primary shrink-0" />
              <span>{lab.organization?.name} • {lab.organization?.district}, {lab.organization?.state}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-xl px-3.5 py-2 text-center">
              <div className="flex items-center justify-center space-x-1 text-amber-600 font-bold text-base">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{lab.averageRating || 4.9}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">Host Rating</div>
            </div>

            <div className="bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-900 rounded-xl px-3.5 py-2 text-center">
              <div className="text-primary font-bold text-base">{lab.trustScore}/100</div>
              <div className="text-[10px] text-muted-foreground">Trust Score</div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {lab.description}
        </p>

        {/* Quick Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-4 border-t">
          <div>
            <span className="text-muted-foreground block">Max Group Size</span>
            <span className="font-bold text-foreground">{lab.capacity} Students</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Location in School</span>
            <span className="font-bold text-foreground">Floor {lab.floor}, {lab.buildingName || 'Science Wing'}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Supervision Ratio</span>
            <span className="font-bold text-foreground">1 Adult per {rules?.supervisionRatioStudents || 15} Students</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Min Class Standard</span>
            <span className="font-bold text-foreground">Class {rules?.minClassStandard || 6} and above</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Rules & Safety */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rules Accordion / Card */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold flex items-center space-x-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>{locale === 'en' ? 'Lab Sharing Rules (Versioned)' : 'प्रयोगशाला नियम'}</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Permitted Days: </strong>
                  <span className="text-muted-foreground">{rules?.allowedDays?.join(', ') || 'Mon, Wed, Fri'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Operating Hours: </strong>
                  <span className="text-muted-foreground">{rules?.allowedStartTime} – {rules?.allowedEndTime}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Teacher Supervision: </strong>
                  <span className="text-muted-foreground">
                    At least 1 verified adult sponsor must be present throughout the entire visit.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Fair Access Quota: </strong>
                  <span className="text-muted-foreground">
                    Max {rules?.maxBookingsPerOrgPerMonth || 4} sessions per requesting institution per month.
                  </span>
                </div>
              </div>
            </div>

            {lab.safetyNotes && (
              <div className="mt-5 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong>Safety Protocol: </strong>
                  <span>{lab.safetyNotes}</span>
                </div>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold flex items-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>{locale === 'en' ? 'Community Reviews' : 'समीक्षाएं एवं अनुभव'}</span>
            </h2>

            {reviews.length === 0 ? (
              <p className="text-xs text-muted-foreground">No public reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-lg bg-muted/40 border text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-foreground">Verified School Manager</span>
                      <div className="flex items-center space-x-0.5 text-amber-500">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Availability Slot Engine & Booking Action */}
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24">
            <h2 className="text-base font-bold flex items-center space-x-2 mb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span>{locale === 'en' ? 'Live Availability' : 'उपलब्ध स्लॉट'}</span>
            </h2>

            {/* Date Picker Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs rounded-lg border bg-background px-3 py-2 font-mono focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Slots List */}
            {availability?.isBlackout ? (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20 mb-4">
                <strong>Blackout Date: </strong>
                {availability.blackoutReason}
              </div>
            ) : availability?.slots && availability.slots.length > 0 ? (
              <div className="space-y-1.5 mb-6 max-h-48 overflow-y-auto">
                {availability.slots.map((s, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center px-3 py-2 rounded text-xs border ${
                      s.isAvailable
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-foreground'
                        : 'bg-muted/40 text-muted-foreground border-transparent opacity-60'
                    }`}
                  >
                    <span className="font-mono">
                      {s.startTime.substring(11, 16)} - {s.endTime.substring(11, 16)}
                    </span>
                    <span className="text-[10px] font-bold">
                      {s.isAvailable ? '✓ Open' : 'Occupied'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-6">
                No slots configured for this day.
              </p>
            )}

            {/* Book CTA */}
            <Link
              href={`/labs/${lab.id}/book?date=${selectedDate}`}
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-700 text-white font-bold text-xs shadow transition-colors flex items-center justify-center space-x-2 text-center"
            >
              <span>{locale === 'en' ? 'Start Booking Wizard' : 'बुकिंग शुरू करें'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[10px] text-muted-foreground text-center mt-2.5">
              Instant Rules Engine evaluation before submission
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
