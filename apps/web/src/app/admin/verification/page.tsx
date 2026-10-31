'use client'

import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileCheck2,
  Shield,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { useLanguage } from '../../../context/language-context'
import { useAuth } from '../../../context/auth-context'
import { Organization } from '@labshare/shared'

export default function AdminVerificationPage() {
  const { locale } = useLanguage()
  const { client } = useAuth()

  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrgs = () => {
    setLoading(true)
    client.orgs
      .list()
      .then(setOrgs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrgs()
  }, [client])

  const handleVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await client.admin.verifyOrg(id, status, 'Verified by Platform Administrator')
      loadOrgs()
    } catch (err: any) {
      alert(`Action failed: ${err.message}`)
    }
  }

  const handleSuspend = async (id: string) => {
    const reason = prompt('Enter official suspension reason:')
    if (!reason) return
    try {
      await client.admin.suspendOrg(id, reason)
      loadOrgs()
    } catch (err: any) {
      alert(`Suspension failed: ${err.message}`)
    }
  }

  return (
    <div className="container py-8 max-w-5xl flex flex-col gap-8">
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200">
            Institutional Accreditation
          </span>
          <span className="text-xs text-muted-foreground">• UDISE & Registration Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
          {locale === 'en' ? 'School & NGO Verification Queue' : 'संस्था सत्यापन एवं मान्यता'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {locale === 'en'
            ? 'Verify schools and community organizations before approving lab access.'
            : 'प्रयोगशाला पहुंच की अनुमति देने से पूर्व संस्थाओं के प्रमाणपत्रों की समीक्षा करें।'}
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="h-44 bg-card border rounded-xl animate-pulse" />
        ) : orgs.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-card border rounded-xl">
            No institutions in review queue.
          </div>
        ) : (
          orgs.map((org) => (
            <div
              key={org.id}
              className="bg-card border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      org.isSuspended
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : org.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {org.isSuspended ? 'SUSPENDED' : org.verificationStatus}
                  </span>
                  <span className="text-xs font-bold text-foreground">{org.name}</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Type: <strong>{org.type.replace('_', ' ')}</strong> • District:{' '}
                  <strong>{org.district}</strong> • Phone: {org.phone}
                </div>

                <div className="text-xs text-muted-foreground">
                  UDISE / Reg No:{' '}
                  <strong className="font-mono text-foreground">
                    {org.udiseCode || org.registrationNumber || 'Pending Document'}
                  </strong>
                </div>

                {org.isSuspended && (
                  <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2 rounded border">
                    Suspension Reason: {org.suspensionReason}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {org.verificationStatus !== 'VERIFIED' && !org.isSuspended && (
                  <>
                    <button
                      onClick={() => handleVerify(org.id, 'VERIFIED')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleVerify(org.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg border text-xs font-bold text-destructive hover:bg-destructive/10"
                    >
                      Reject
                    </button>
                  </>
                )}

                {!org.isSuspended ? (
                  <button
                    onClick={() => handleSuspend(org.id)}
                    className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 text-xs font-bold hover:bg-rose-50"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => handleVerify(org.id, 'VERIFIED')}
                    className="px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-muted"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
