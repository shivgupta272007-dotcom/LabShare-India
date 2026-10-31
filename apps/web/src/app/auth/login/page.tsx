'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Phone,
  School,
  Shield,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '../../../context/auth-context'
import { useLanguage } from '../../../context/language-context'
import { DEMO_ACCOUNTS, DEMO_OTP, UserRole } from '@labshare/shared'

export default function LoginPage() {
  const router = useRouter()
  const { client, loginWithOtp, switchRole } = useAuth()
  const { locale, t } = useLanguage()

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(
        locale === 'en'
          ? 'Please enter a valid 10-digit Indian mobile number.'
          : 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।'
      )
      return
    }

    setError(null)
    setLoading(true)
    try {
      const res = await client.auth.sendOtp(phone)
      setOtp(res.demoOtp || DEMO_OTP)
      setStep('OTP')
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await loginWithOtp(phone, otp)
      router.push('/labs')
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemoLogin = async (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setLoading(true)
    try {
      await switchRole(account.role as UserRole)
      if (account.role === 'MANAGER') {
        router.push('/manager/inbox')
      } else if (account.role === 'ADMIN') {
        router.push('/admin/audit')
      } else if (account.role === 'OWNER_SCHOOL') {
        router.push('/owner/labs')
      } else {
        router.push('/labs')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12 flex flex-col items-center max-w-xl">
      {/* Header */}
      <div className="text-center mb-8 flex flex-col items-center">
        <Link href="/" className="mb-4 inline-block group">
          <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-slate-200/90 transition-all group-hover:shadow-md group-hover:scale-[1.02]">
            <img
              src="/logo.png"
              alt="LabShare India | लैबशेयर इंडिया"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">
          {locale === 'en' ? 'Sign In to LabShare' : 'लैबशेयर में साइन इन करें'}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {locale === 'en'
            ? 'Mobile-first passwordless sign in with 6-digit OTP'
            : '6-अंकों के ओटीपी द्वारा सुरक्षित मोबाइल साइन-इन'}
        </p>
      </div>

      {/* 1-Click Institutional Role Directory (Fast-Track Login) */}
      <div className="w-full bg-primary-50/70 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900 rounded-xl p-5 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-primary">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>
              {locale === 'en' ? 'Institutional Role Directory (Instant Access)' : 'संस्थागत भूमिका डायरेक्ट्री (त्वरित प्रवेश)'}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            {locale === 'en' ? 'Verified Test Personas' : 'सत्यापित खाते'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.phone}
              onClick={() => handleQuickDemoLogin(acc)}
              disabled={loading}
              className="text-left p-3 rounded-lg border bg-card hover:border-primary transition-all flex flex-col justify-between hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-foreground">
                    {acc.role.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">{acc.phone}</span>
                </div>
                <div className="text-xs font-bold text-foreground">{acc.name}</div>
                {acc.org && <div className="text-[10px] text-muted-foreground truncate">{acc.org}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Standard OTP Form */}
      <div className="w-full bg-card border rounded-xl p-6 shadow-sm">
        {error && (
          <div className="p-3 mb-4 text-xs bg-destructive/10 text-destructive rounded-lg border border-destructive/20 font-medium">
            {error}
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {locale === 'en' ? 'Mobile Number' : 'मोबाइल नंबर'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-4 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm shadow transition-colors flex items-center justify-center space-x-2"
            >
              <span>{locale === 'en' ? 'Send OTP' : 'ओटीपी भेजें'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
              <span>OTP sent to +91 {phone}</span>
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="text-primary font-semibold hover:underline"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {locale === 'en' ? 'Enter 6-Digit OTP' : '6 अंकों का ओटीपी डालें'}
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2 text-center text-lg tracking-widest font-mono rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Demo OTP: <strong className="text-primary font-mono">{DEMO_OTP}</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm shadow transition-colors"
            >
              {locale === 'en' ? 'Verify & Sign In' : 'सत्यापित करें एवं साइन इन करें'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
