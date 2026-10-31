'use client'

import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Database,
  Download,
  FileCheck2,
  Filter,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { useLanguage } from '../../../context/language-context'
import { useAuth } from '../../../context/auth-context'
import { AuditLog } from '@labshare/shared'

export default function AdminAuditPage() {
  const { locale } = useLanguage()
  const { client } = useAuth()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [verification, setVerification] = useState<{
    isValid: boolean
    totalEntries: number
    statusBadge: string
    timestamp: string
  } | null>(null)
  const [verifying, setVerifying] = useState(false)

  const loadAuditLogs = () => {
    setLoading(true)
    client.admin
      .getAuditLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAuditLogs()
  }, [client])

  const handleVerifyChain = async () => {
    setVerifying(true)
    try {
      const res = await client.admin.verifyChain()
      setVerification(res)
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="container py-8 max-w-6xl flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200">
              Compliance & Security
            </span>
            <span className="text-xs text-muted-foreground">• Append-Only Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {locale === 'en' ? 'Audit Ledger & Hash-Chain Verification' : 'ऑडिट लेजर एवं सुरक्षा सत्यापन'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {locale === 'en'
              ? 'Every state transition and sensitive action is cryptographically hash-chained with SHA-256.'
              : 'प्रत्येक स्थिति परिवर्तन एवं कार्रवाई SHA-256 क्रिप्टोग्राफिक हैश-चेन द्वारा सुरक्षित रूप से दर्ज होती है।'}
          </p>
        </div>

        {/* Verification Trigger Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center space-x-1.5 transition-all"
          >
            {verifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>{locale === 'en' ? 'Verify Chain Integrity' : 'चेन अखंडता सत्यापित करें'}</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner (Hero feature) */}
      {verification && (
        <div
          className={`p-5 rounded-2xl border flex items-start space-x-3.5 shadow-sm transition-all ${
            verification.isValid
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {verification.isValid ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          )}

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm">
                {verification.isValid
                  ? '✓ Cryptographic Hash Chain Valid & Intact'
                  : '✗ Hash Chain Compromised'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/60 dark:bg-black/40 font-bold">
                {verification.totalEntries} BLOCKS VERIFIED
              </span>
            </div>
            <p className="text-xs mt-1 leading-relaxed opacity-90">
              {verification.isValid
                ? 'Genesis to head integrity scan passed with zero tampering detected. All block links (prev_hash -> hash) match canonical SHA-256 values.'
                : 'Warning: Hash mismatch detected. One or more database rows have been altered or deleted.'}
            </p>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b flex justify-between items-center bg-muted/20">
          <div className="text-xs font-bold text-foreground flex items-center space-x-2">
            <Lock className="w-4 h-4 text-primary" />
            <span>Immutable Ledger Records ({logs.length})</span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <a
              href="http://localhost:3001/api/v1/admin/audit/export?format=csv"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded border bg-background hover:bg-muted font-medium flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </a>
            <a
              href="http://localhost:3001/api/v1/admin/audit/export?format=json"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded border bg-background hover:bg-muted font-medium flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </a>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
            Loading ledger...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-[11px] font-bold text-muted-foreground uppercase">
                <tr>
                  <th className="p-3">Seq</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Actor Role</th>
                  <th className="p-3 font-mono">SHA-256 Hash</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 font-mono text-[11px]">
                    <td className="p-3 font-bold text-foreground">#{log.sequence}</td>
                    <td className="p-3 font-sans font-bold">
                      <span className="px-2 py-0.5 rounded bg-muted text-foreground">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-sans text-muted-foreground">
                      {log.entityType} ({log.entityId ? log.entityId.substring(0, 8) : 'Sys'})
                    </td>
                    <td className="p-3 font-sans">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {log.actorRole || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="p-3 truncate max-w-[180px] text-muted-foreground" title={log.hash}>
                      {log.hash}
                    </td>
                    <td className="p-3 font-sans text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
