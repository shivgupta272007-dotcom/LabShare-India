'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  HelpCircle,
  Info,
  Microscope,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useLanguage } from '../../../../context/language-context'
import { useAuth } from '../../../../context/auth-context'
import { Lab, RulesEvaluationResult, StudentGroup } from '@labshare/shared'

export default function BookingWizardPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const labId = params.id as string

  const { locale } = useLanguage()
  const { client, user, role } = useAuth()

  const [step, setStep] = useState<number>(1)
  const [lab, setLab] = useState<Lab | null>(null)
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([])

  // Form State
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [date, setDate] = useState<string>(searchParams.get('date') || '2026-11-06')
  const [startTime, setStartTime] = useState<string>('15:30')
  const [endTime, setEndTime] = useState<string>('17:30')
  const [headcount, setHeadcount] = useState<number>(24)
  const [purpose, setPurpose] = useState<string>('Class 8 Optics and light reflection hands-on practical experiment.')

  // Sponsor Vouch Declaration Form
  const [declarationAccepted, setDeclarationAccepted] = useState(false)
  const [parentConsentObtained, setParentConsentObtained] = useState(true)
  const [supervisorName, setSupervisorName] = useState('Sunita Sharma')
  const [supervisorPhone, setSupervisorPhone] = useState('9000000005')

  // Rules Engine Live Output
  const [rulesResult, setRulesResult] = useState<RulesEvaluationResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null)

  useEffect(() => {
    client.labs.getById(labId).then(setLab).catch(console.error)
    client.orgs
      .listStudentGroups()
      .then((groups) => {
        setStudentGroups(groups)
        if (groups[0]) setSelectedGroupId(groups[0].id)
      })
      .catch(() => {})
  }, [client, labId])

  // Live Rules Engine Evaluation as parameters change
  useEffect(() => {
    if (!labId || !date || !startTime || !endTime) return

    client.rules
      .evaluate({
        labId,
        studentGroupId: selectedGroupId || undefined,
        date,
        startTime,
        endTime,
        headcount,
        equipmentRequested: [],
      })
      .then(setRulesResult)
      .catch(() => {})
  }, [client, labId, selectedGroupId, date, startTime, endTime, headcount])

  const handleSubmitBooking = async () => {
    setSubmitting(true)
    try {
      const idempotencyKey = crypto.randomUUID()
      const booking = await client.bookings.create(
        {
          labId,
          studentGroupId: selectedGroupId || 'g0000000-0000-0000-0000-000000000001',
          date,
          startTime,
          endTime,
          headcount,
          purposeDescription: purpose,
          equipmentRequested: [],
        },
        idempotencyKey
      )

      // Submit vouch declaration
      await client.bookings.submitVouch(booking.id, {
        declarationText:
          'I, as the designated Teacher Sponsor, declare that I will personally supervise this student group throughout the session and ensure full compliance with lab safety rules.',
        consentChecklist: [
          { key: 'minor_safety', label: 'Student safety protocol reviewed', labelHi: 'सुरक्षा नियम समझाए गए', checked: true, required: true },
          { key: 'parent_consent', label: 'Parental permission letters filed', labelHi: 'अभिभावक सहमति पत्र प्राप्त', checked: parentConsentObtained, required: true },
        ],
        parentConsentObtained,
        supervisingAdultName: supervisorName,
        supervisingAdultPhone: supervisorPhone,
        supervisingAdultRelation: 'Teacher & Sponsor',
      })

      setBookingSuccessId(booking.id)
      setStep(5) // Success step
    } catch (err: any) {
      alert(`Booking submission error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!lab) return <div className="container py-12 text-center text-xs">Loading lab...</div>

  return (
    <div className="container py-8 max-w-3xl flex flex-col gap-8">
      {/* Step Indicators */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/labs/${lab.id}`}
            className="text-xs text-muted-foreground hover:text-primary flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel and back to lab</span>
          </Link>
          <div className="text-xs font-semibold text-muted-foreground">
            Step {step} of 4
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['Student Group', 'Time Slot', 'Vouching & Safety', 'Rules Review'].map((title, i) => (
            <div key={i} className="space-y-1">
              <div
                className={`h-1.5 rounded-full ${
                  step > i + 1
                    ? 'bg-emerald-600'
                    : step === i + 1
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Student Group */}
      {step === 1 && (
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {locale === 'en' ? 'Select Student Group' : 'छात्र समूह चुनें'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select your registered class or cohort. No student names are ever stored.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Registered Student Group
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full text-xs rounded-lg border bg-background px-3 py-2.5 font-medium"
              >
                {studentGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.headcount} students, Class {g.classRangeMin}–{g.classRangeMax})
                  </option>
                ))}
                <option value="custom">Manual group specification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Headcount (Students attending)
              </label>
              <input
                type="number"
                min={5}
                max={lab.capacity}
                value={headcount}
                onChange={(e) => setHeadcount(parseInt(e.target.value, 10))}
                className="w-full text-xs rounded-lg border bg-background px-3 py-2 font-mono"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Lab safety limit: <strong>{lab.capacity} students</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Visit Learning Objective / Purpose
              </label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full text-xs rounded-lg border bg-background px-3 py-2"
                placeholder="Describe practical experiments to be conducted..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
            >
              <span>Next: Choose Slot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Time Slot */}
      {step === 2 && (
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {locale === 'en' ? 'Choose Date & Slot' : 'तारीख एवं समय चुनें'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Operating hours for this lab are {lab.currentRules?.allowedStartTime} – {lab.currentRules?.allowedEndTime}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs rounded-lg border bg-background px-3 py-2 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs rounded-lg border bg-background px-3 py-2 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs rounded-lg border bg-background px-3 py-2 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-lg border text-xs font-semibold hover:bg-muted"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
            >
              <span>Next: Sponsor Vouching</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Sponsor Vouch Declaration & Minor Safety */}
      {step === 3 && (
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>{locale === 'en' ? 'Teacher Sponsor Digital Declaration' : 'शिक्षक प्रायोजक घोषणा'}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Minor safety requirement: Every student group booking requires a verified adult sponsor on record.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border space-y-3">
            <p className="text-xs text-foreground italic leading-relaxed">
              "I, as the responsible Teacher/Sponsor, solemnly declare that I will accompany and supervise these {headcount} students throughout the laboratory session, enforce all safety and equipment guidelines, and coordinate prompt check-in and checkout."
            </p>
            <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground">
              <span>Timestamp: {new Date().toLocaleTimeString()}</span>
              <span>•</span>
              <span>Audit Logging: Active (IP recorded)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Supervising Adult Name
              </label>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="w-full text-xs rounded-lg border bg-background px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Emergency Mobile Phone
              </label>
              <input
                type="tel"
                value={supervisorPhone}
                onChange={(e) => setSupervisorPhone(e.target.value)}
                className="w-full text-xs rounded-lg border bg-background px-3 py-2 font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={parentConsentObtained}
                onChange={(e) => setParentConsentObtained(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <span>Parental permission slips obtained and retained on school file.</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <span className="font-bold text-foreground">
                I accept the digital declaration and take full supervisory responsibility.
              </span>
            </label>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-lg border text-xs font-semibold hover:bg-muted"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!declarationAccepted || !parentConsentObtained}
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
            >
              <span>Next: Review Rules Verdict</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Rules Engine Evaluation Output & Confirmation */}
      {step === 4 && (
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>{locale === 'en' ? 'Automated Rules Engine Verdict' : 'नियम इंजन विश्लेषण'}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time validation against host school rules and fair-sharing quotas.
            </p>
          </div>

          {/* Verdict Banner */}
          {rulesResult && (
            <div
              className={`p-4 rounded-xl border flex items-start space-x-3 ${
                rulesResult.decision === 'PASS'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                  : rulesResult.decision === 'FAIL'
                  ? 'bg-destructive/10 border-destructive/20 text-destructive'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-900 dark:text-amber-200'
              }`}
            >
              {rulesResult.decision === 'PASS' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : rulesResult.decision === 'FAIL' ? (
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="font-bold text-sm">
                  {rulesResult.decision === 'PASS'
                    ? rulesResult.autoApprove
                      ? 'Instant Auto-Approval Qualified!'
                      : 'All Rules Passed'
                    : rulesResult.decision === 'FAIL'
                    ? 'Rule Violation Detected'
                    : 'Manager Review Required'}
                </h3>
                <p className="text-xs mt-0.5 opacity-90">
                  {rulesResult.autoApprove
                    ? 'Your institution holds a verified high Trust Score (>=80), qualifying this slot for immediate confirmation.'
                    : 'Request satisfies safety limits and will be sent to the host school Lab In-Charge for confirmation.'}
                </p>
              </div>
            </div>
          )}

          {/* Granular Rules Breakdown */}
          {rulesResult && (
            <div className="space-y-2 border rounded-xl p-4 bg-muted/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Rule Checks Log
              </h4>
              {rulesResult.explanations.map((exp, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0">
                  <span className="font-medium text-foreground">{exp.rule}</span>
                  <span
                    className={`text-[11px] font-semibold ${
                      exp.status === 'PASS'
                        ? 'text-emerald-600'
                        : exp.status === 'FAIL'
                        ? 'text-destructive'
                        : 'text-amber-600'
                    }`}
                  >
                    {locale === 'en' ? exp.message : exp.messageHi}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Final Submit Button */}
          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-lg border text-xs font-semibold hover:bg-muted"
            >
              Back
            </button>
            <button
              onClick={handleSubmitBooking}
              disabled={submitting || rulesResult?.decision === 'FAIL'}
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
            >
              <span>{submitting ? 'Submitting...' : 'Confirm & Submit Booking'}</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success Confirmation Screen */}
      {step === 5 && (
        <div className="bg-card border rounded-2xl p-8 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-foreground">
              {locale === 'en' ? 'Booking Successfully Submitted!' : 'बुकिंग सफलतापूर्वक जमा हुई!'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Your visit request for <strong>{lab.name}</strong> on <strong>{date}</strong> ({startTime} - {endTime}) has been logged.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/bookings"
              className="px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-700 shadow"
            >
              {locale === 'en' ? 'Go to My Bookings' : 'मेरी बुकिंग देखें'}
            </Link>
            <Link
              href="/labs"
              className="px-5 py-2.5 rounded-lg border text-xs font-bold hover:bg-muted"
            >
              {locale === 'en' ? 'Browse More Labs' : 'अन्य लैब खोजें'}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
