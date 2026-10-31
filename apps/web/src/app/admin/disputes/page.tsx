'use client'

import React, { useEffect, useState } from 'react'
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Gavel,
  MessageSquare,
  ShieldAlert,
  X,
} from 'lucide-react'
import { useLanguage } from '../../../context/language-context'
import { useAuth } from '../../../context/auth-context'

export default function AdminDisputesPage() {
  const { locale } = useLanguage()
  const { client } = useAuth()

  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null)
  const [resolutionText, setResolutionText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadDisputes = () => {
    setLoading(true)
    client.admin
      .getDisputes()
      .then(setDisputes)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDisputes()
  }, [client])

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDispute) return
    setSubmitting(true)
    try {
      await client.admin.resolveDispute(selectedDispute.id, resolutionText, 'Official Tribunal Ruling')
      setSelectedDispute(null)
      setResolutionText('')
      loadDisputes()
    } catch (err: any) {
      alert(`Resolution failed: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-8 max-w-5xl flex flex-col gap-8">
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200">
            Platform Tribunal
          </span>
          <span className="text-xs text-muted-foreground">• Fair Resolution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
          {locale === 'en' ? 'Dispute Resolution Tribunal' : 'विवाद समाधान ट्रिब्यूनल'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {locale === 'en'
            ? 'Review and resolve post-session equipment damage or compliance claims.'
            : 'प्रयोगशाला उपकरण क्षति या नियमों के उल्लंघन से संबंधित मामलों की समीक्षा एवं निर्णय।'}
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="h-44 bg-card border rounded-xl animate-pulse" />
        ) : disputes.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-card border rounded-xl">
            No disputes on record. Community interactions are healthy!
          </div>
        ) : (
          disputes.map((d) => (
            <div
              key={d.id}
              className="bg-card border rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        d.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {d.status}
                    </span>
                    <h2 className="text-base font-bold text-foreground">{d.title}</h2>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Booking ID: <span className="font-mono">{d.bookingId?.substring(0, 8)}</span> • Raised:{' '}
                    {new Date(d.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {d.status !== 'RESOLVED' && (
                  <button
                    onClick={() => {
                      setSelectedDispute(d)
                      setResolutionText('Fee waived under platform educational goodwill buffer.')
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-700 text-white text-xs font-bold shadow flex items-center space-x-1"
                  >
                    <Gavel className="w-4 h-4" />
                    <span>Issue Ruling</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {d.description}
              </p>

              {/* Comments Thread */}
              {d.comments && d.comments.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Stakeholder Statements
                  </h4>
                  {d.comments.map((c: any) => (
                    <div key={c.id} className="p-3 rounded-lg bg-muted/40 border text-xs">
                      <div className="text-[10px] font-semibold text-muted-foreground mb-1">
                        Teacher Sponsor / School Statement
                      </div>
                      <p className="text-foreground">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {d.resolution && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs">
                  <strong className="text-emerald-900 dark:text-emerald-300">
                    Official Ruling:
                  </strong>
                  <p className="text-emerald-800 dark:text-emerald-200 mt-0.5">
                    {d.resolution}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Ruling Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Issue Official Tribunal Ruling</h3>
              <button onClick={() => setSelectedDispute(null)} className="p-1 rounded hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Ruling & Order Details
                </label>
                <textarea
                  rows={4}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full text-xs rounded-lg border bg-background p-2.5"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedDispute(null)}
                  className="px-3.5 py-2 border rounded-lg text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary hover:bg-primary-700 text-white text-xs font-bold rounded-lg shadow"
                >
                  {submitting ? 'Executing Ruling...' : 'Publish Official Verdict'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
