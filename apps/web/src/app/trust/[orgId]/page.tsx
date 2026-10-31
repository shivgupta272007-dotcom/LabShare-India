'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  ShieldAlert,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import { useLanguage } from '../../../context/language-context'
import { useAuth } from '../../../context/auth-context'
import { TrustScore } from '@labshare/shared'

export default function TrustScoreDetailPage() {
  const params = useParams()
  const orgId = params.orgId as string

  const { locale } = useLanguage()
  const { client } = useAuth()

  const [score, setScore] = useState<TrustScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.analytics
      .getTrustScore(orgId)
      .then(setScore)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [client, orgId])

  if (loading) return <div className="container py-12 text-center text-xs">Computing score breakdown...</div>
  if (!score) return <div className="container py-12 text-center text-xs">Organization trust record not found.</div>

  const b = score.breakdown

  return (
    <div className="container py-8 max-w-4xl flex flex-col gap-8">
      <div>
        <Link
          href="/labs"
          className="text-xs text-muted-foreground hover:text-primary flex items-center space-x-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            Open Algorithm
          </span>
          <span className="text-xs text-muted-foreground">• 100% Transparent Formula</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
          {locale === 'en' ? 'Institutional Trust Score & Breakdown' : 'पारदर्शी ट्रस्ट स्कोर विश्लेषण'}
        </h1>
      </div>

      {/* Hero Score Badge */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Overall Score
          </span>
          <div className="text-4xl sm:text-5xl font-extrabold text-primary mt-1">
            {score.score} <span className="text-lg font-normal text-muted-foreground">/ 100</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 max-w-md">
            {locale === 'en' ? b.explanation : b.explanationHi}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/40 border text-xs space-y-1.5 w-full sm:w-auto">
          <div>
            <strong>Completed Sessions: </strong>
            <span>{score.completedBookings}</span>
          </div>
          <div>
            <strong>On-Time Rate: </strong>
            <span>{score.onTimeRate}%</span>
          </div>
          <div>
            <strong>Incident-Free Rate: </strong>
            <span>{score.zeroIncidentRate}%</span>
          </div>
          <div>
            <strong>Average Rating: </strong>
            <span>{score.averageRating} ★</span>
          </div>
        </div>
      </div>

      {/* 7 Formula Factors Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">
          {locale === 'en' ? 'Formula Components & Weightage' : 'ट्रस्ट स्कोर के 7 प्रमुख कारक'}
        </h2>

        <div className="space-y-3">
          <div className="bg-card border rounded-xl p-4 flex justify-between items-center text-xs shadow-sm">
            <div>
              <div className="font-bold text-foreground">Completed Lab Sessions (Max 25 pts)</div>
              <div className="text-muted-foreground mt-0.5">Scales linearly up to 20 completed visits.</div>
            </div>
            <div className="text-sm font-extrabold text-primary font-mono">
              {b.completedBookingsScore} / 25
            </div>
          </div>

          <div className="bg-card border rounded-xl p-4 flex justify-between items-center text-xs shadow-sm">
            <div>
              <div className="font-bold text-foreground">On-Time Arrival Record (Max 20 pts)</div>
              <div className="text-muted-foreground mt-0.5">Prompt arrival within scheduled slot window.</div>
            </div>
            <div className="text-sm font-extrabold text-primary font-mono">
              {b.onTimeScore} / 20
            </div>
          </div>

          <div className="bg-card border rounded-xl p-4 flex justify-between items-center text-xs shadow-sm">
            <div>
              <div className="font-bold text-foreground">Zero Incident & Clean Checkout (Max 20 pts)</div>
              <div className="text-muted-foreground mt-0.5">Deducts 5 pts per flagged equipment damage or rule breach.</div>
            </div>
            <div className="text-sm font-extrabold text-primary font-mono">
              {b.incidentScore} / 20
            </div>
          </div>

          <div className="bg-card border rounded-xl p-4 flex justify-between items-center text-xs shadow-sm">
            <div>
              <div className="font-bold text-foreground">Host School Ratings (Max 15 pts)</div>
              <div className="text-muted-foreground mt-0.5">Direct 1-5 star feedback from host lab in-charges.</div>
            </div>
            <div className="text-sm font-extrabold text-primary font-mono">
              {b.ratingScore} / 15
            </div>
          </div>

          <div className="bg-card border rounded-xl p-4 flex justify-between items-center text-xs shadow-sm">
            <div>
              <div className="font-bold text-foreground">No Disputes Decided Against Org (Max 10 pts)</div>
              <div className="text-muted-foreground mt-0.5">Zero tribunal rulings of fault.</div>
            </div>
            <div className="text-sm font-extrabold text-primary font-mono">
              {b.disputeScore} / 10
            </div>
          </div>

          <div className="bg-card border rounded-xl p-4 flex justify-between items-center text-xs shadow-sm">
            <div>
              <div className="font-bold text-foreground">Zero No-Shows (Max 5 pts)</div>
              <div className="text-muted-foreground mt-0.5">Prevents blocking slots without showing up.</div>
            </div>
            <div className="text-sm font-extrabold text-primary font-mono">
              {b.noShowScore} / 5
            </div>
          </div>

          <div className="bg-card border rounded-xl p-4 flex justify-between items-center text-xs shadow-sm">
            <div>
              <div className="font-bold text-foreground">Account Age Stability (Max 5 pts)</div>
              <div className="text-muted-foreground mt-0.5">Recognizes established community partnerships over time.</div>
            </div>
            <div className="text-sm font-extrabold text-primary font-mono">
              {b.ageScore} / 5
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
