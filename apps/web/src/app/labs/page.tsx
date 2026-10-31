'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Award,
  Calendar,
  Check,
  Compass,
  Filter,
  Layers,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { useLanguage } from '../../context/language-context'
import { useAuth } from '../../context/auth-context'
import { BUNDELKHAND_DISTRICTS, Lab, LabType } from '@labshare/shared'

export default function LabsSearchPage() {
  const { locale, t } = useLanguage()
  const { client } = useAuth()

  const [labs, setLabs] = useState<Array<Lab & { distanceKm?: number }>>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Jhansi')
  const [minCapacity, setMinCapacity] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>('distance')

  useEffect(() => {
    setLoading(true)
    client.labs
      .search({
        type: selectedType || undefined,
        district: selectedDistrict || undefined,
        minCapacity: minCapacity || undefined,
        lat: 25.4484, // Jhansi central coordinates for demo
        lng: 78.5685,
        sortBy,
      })
      .then(setLabs)
      .catch((err) => console.error('Failed to load labs:', err))
      .finally(() => setLoading(false))
  }, [client, selectedType, selectedDistrict, minCapacity, sortBy])

  const labTypes: Array<{ key: string; labelEn: string; labelHi: string }> = [
    { key: '', labelEn: 'All Labs', labelHi: 'सभी लैब' },
    { key: 'SCIENCE_LAB', labelEn: 'Science Lab', labelHi: 'विज्ञान' },
    { key: 'COMPUTER_LAB', labelEn: 'Computer Lab', labelHi: 'कंप्यूटर' },
    { key: 'PROJECTOR_ROOM', labelEn: 'Projector / AV', labelHi: 'प्रोजेक्टर' },
    { key: 'WORKSHOP', labelEn: 'Robotics Workshop', labelHi: 'रोबोटिक्स' },
    { key: 'LIBRARY', labelEn: 'Reference Library', labelHi: 'पुस्तकालय' },
  ]

  return (
    <div className="container py-8 flex flex-col gap-8">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {locale === 'en' ? 'Discover Nearby School Labs' : 'पास की स्कूल लैब खोजें'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {locale === 'en'
            ? 'Find verified science labs, computer rooms, and workshops open after school hours in Bundelkhand.'
            : 'बुंदेलखंड में स्कूल समय के बाद उपलब्ध सत्यापित विज्ञान और कंप्यूटर प्रयोगशालाएं।'}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Lab Type Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {labTypes.map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedType === t.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-muted/70 hover:bg-muted text-foreground'
              }`}
            >
              {locale === 'en' ? t.labelEn : t.labelHi}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* District Selector */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-muted-foreground font-medium">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs rounded-md border bg-background px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-primary"
            >
              <option value="">All Districts</option>
              {BUNDELKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-muted-foreground font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs rounded-md border bg-background px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-primary"
            >
              <option value="distance">Distance (Nearest)</option>
              <option value="trust">Trust Score</option>
              <option value="rating">Host Rating</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lab Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card border rounded-xl p-5 h-64 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
              <div className="h-16 bg-muted rounded mb-4"></div>
            </div>
          ))}
        </div>
      ) : labs.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-xl p-8">
          <p className="text-sm font-semibold text-muted-foreground">
            {locale === 'en'
              ? 'No labs match the selected filter criteria in this district.'
              : 'इस जिले में कोई लैब उपलब्ध नहीं है। कृपया फ़िल्टर बदलें।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-5">
                {/* Type & Rating */}
                <div className="flex justify-between items-start mb-2.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {lab.type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{lab.averageRating || 4.9}</span>
                  </div>
                </div>

                {/* Title & Host Org */}
                <h2 className="font-bold text-base text-foreground mb-1 leading-snug">
                  {lab.name}
                </h2>
                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-primary shrink-0" />
                  <span className="truncate">{lab.organization?.name || 'School'}</span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                  {lab.description}
                </p>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t bg-muted/20 -mx-5 -mb-5 px-5 py-3">
                  <div>
                    <div className="text-muted-foreground text-[10px]">Distance</div>
                    <div className="font-bold text-foreground">
                      {lab.distanceKm !== undefined ? `${lab.distanceKm} km` : 'Near'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px]">Capacity</div>
                    <div className="font-bold text-foreground">{lab.capacity}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px]">Trust Score</div>
                    <div className="font-bold text-primary">{lab.trustScore}/100</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/40 border-t flex justify-between items-center">
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {lab.isAccessible ? '✓ Wheelchair Accessible' : 'Standard Access'}
                </span>
                <Link
                  href={`/labs/${lab.id}`}
                  className="px-3.5 py-1.5 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary-700 transition-colors shadow-sm"
                >
                  {locale === 'en' ? 'Check Slots' : 'स्लॉट देखें'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
