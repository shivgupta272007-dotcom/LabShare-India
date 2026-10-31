'use client'

import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Layers,
  Microscope,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useLanguage } from '../../../context/language-context'
import { useAuth } from '../../../context/auth-context'
import { Lab, LabRules } from '@labshare/shared'

export default function OwnerLabsPage() {
  const { locale } = useLanguage()
  const { client } = useAuth()

  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null)

  // Rules form state
  const [allowedDays, setAllowedDays] = useState<string[]>(['MON', 'WED', 'FRI', 'SAT'])
  const [startTime, setStartTime] = useState('15:00')
  const [endTime, setEndTime] = useState('18:30')
  const [maxGroupSize, setMaxGroupSize] = useState(32)
  const [minClassStandard, setMinClassStandard] = useState(6)
  const [supervisionStudents, setSupervisionStudents] = useState(15)
  const [autoApproveScore, setAutoApproveScore] = useState(85)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const loadLabs = () => {
    setLoading(true)
    client.labs
      .search({})
      .then((all) => {
        setLabs(all)
        if (all[0]) {
          setSelectedLab(all[0])
          const r = all[0].currentRules
          if (r) {
            setAllowedDays(r.allowedDays)
            setStartTime(r.allowedStartTime)
            setEndTime(r.allowedEndTime)
            setMaxGroupSize(r.maxGroupSize)
            setMinClassStandard(r.minClassStandard || 6)
            setSupervisionStudents(r.supervisionRatioStudents || 15)
            setAutoApproveScore(r.autoApproveForTrustedScore || 85)
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadLabs()
  }, [client])

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLab) return
    setSaving(true)
    setSaveSuccess(false)
    try {
      await client.labs.saveRules(selectedLab.id, {
        allowedDays,
        allowedStartTime: startTime,
        allowedEndTime: endTime,
        maxGroupSize,
        minClassStandard,
        supervisionRatioStudents: supervisionStudents,
        autoApproveForTrustedScore: autoApproveScore,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      alert(`Save failed: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const allWeekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  const toggleDay = (day: string) => {
    if (allowedDays.includes(day)) {
      if (allowedDays.length > 1) {
        setAllowedDays(allowedDays.filter((d) => d !== day))
      }
    } else {
      setAllowedDays([...allowedDays, day])
    }
  }

  // Simulated live impact preview: estimate % requests blocked
  const estimatedBlockedRate = Math.min(
    95,
    Math.max(5, (12 - minClassStandard) * 4 + (35 - maxGroupSize) * 2 + (7 - allowedDays.length) * 8)
  )

  return (
    <div className="container py-8 max-w-6xl flex flex-col gap-8">
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200">
            Host School Administration
          </span>
          <span className="text-xs text-muted-foreground">• Lab Listing & Access Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
          {locale === 'en' ? 'School Labs & Rules Builder' : 'मेरी प्रयोगशालाएं एवं नियम'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {locale === 'en'
            ? 'Configure after-hours operating windows, student grade thresholds, and auto-approval triggers.'
            : 'प्रयोगशाला के संचालन नियम, समय-सीमा, सुरक्षा मानक और स्वतः-स्वीकृति सीमा निर्धारित करें।'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Labs List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground">
            {locale === 'en' ? 'Your Institutional Labs' : 'आपकी प्रयोगशालाएं'}
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-card border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {labs.map((lab) => (
                <button
                  key={lab.id}
                  onClick={() => {
                    setSelectedLab(lab)
                    const r = lab.currentRules
                    if (r) {
                      setAllowedDays(r.allowedDays)
                      setStartTime(r.allowedStartTime)
                      setEndTime(r.allowedEndTime)
                      setMaxGroupSize(r.maxGroupSize)
                      setMinClassStandard(r.minClassStandard || 6)
                      setSupervisionStudents(r.supervisionRatioStudents || 15)
                      setAutoApproveScore(r.autoApproveForTrustedScore || 85)
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedLab?.id === lab.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                      {lab.type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-bold text-primary">
                      Rule v{lab.currentRules?.version || 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-foreground truncate">{lab.name}</h3>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Capacity: {lab.capacity} • Shared: {lab.totalHoursShared} hrs
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Rules Builder with Live Preview */}
        {selectedLab && (
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveRules} className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Rule Builder: {selectedLab.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Modifying rules automatically creates a versioned snapshot (v{(selectedLab.currentRules?.version || 1) + 1}).
                  </p>
                </div>

                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>

              {/* Allowed Days */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Operating Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {allWeekDays.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        allowedDays.includes(d)
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Window */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Allowed Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Allowed End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border bg-background px-3 py-2"
                  />
                </div>
              </div>

              {/* Headcount & Grade Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Max Student Group Size
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={selectedLab.capacity}
                    value={maxGroupSize}
                    onChange={(e) => setMaxGroupSize(parseInt(e.target.value, 10))}
                    className="w-full text-xs font-mono rounded-lg border bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Minimum Class / Standard
                  </label>
                  <select
                    value={minClassStandard}
                    onChange={(e) => setMinClassStandard(parseInt(e.target.value, 10))}
                    className="w-full text-xs rounded-lg border bg-background px-3 py-2"
                  >
                    {[5, 6, 7, 8, 9, 10, 11, 12].map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls} and above
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Auto Approval Trust Score Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-foreground">
                    Auto-Approval Trust Score Threshold
                  </label>
                  <span className="text-xs font-bold text-primary font-mono">{autoApproveScore}/100</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={100}
                  step={5}
                  value={autoApproveScore}
                  onChange={(e) => setAutoApproveScore(parseInt(e.target.value, 10))}
                  className="w-full accent-primary"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Visiting schools with a Trust Score above {autoApproveScore} bypass manual manager review and are confirmed instantly.
                </p>
              </div>

              {/* Live Rule Impact Simulation Banner */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Simulated Rule Impact:</strong>
                  <span>
                    Based on historical demand, this rule configuration will accept ~
                    <strong className="text-foreground">{100 - estimatedBlockedRate}%</strong> of visiting group requests and filter out{' '}
                    <strong className="text-destructive">{estimatedBlockedRate}%</strong> for safety/capacity limits.
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-700 text-white font-bold text-xs flex items-center space-x-2 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Publishing Version...' : 'Publish Versioned Rules'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
