'use client'

import React, { useState } from 'react'
import { Compass, Loader2, MapPin, Navigation, Search, X } from 'lucide-react'
import { geocodeLocationQuery } from '@labshare/shared'

interface LocationSearchBarProps {
  onLocationSelect: (lat: number, lng: number, label: string) => void
  currentLocationName?: string
  locale?: 'en' | 'hi'
}

export function LocationSearchBar({
  onLocationSelect,
  currentLocationName,
  locale = 'en',
}: LocationSearchBarProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [locatingUser, setLocatingUser] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setErrorMsg(null)
    try {
      const result = await geocodeLocationQuery(query)
      if (result) {
        onLocationSelect(result.lat, result.lng, result.displayName)
        setQuery('')
      } else {
        setErrorMsg(
          locale === 'hi'
            ? 'स्थान नहीं मिला। कृपया पिनकोड या शहर का नाम जांचें।'
            : 'Location not found. Try entering a city, town or pincode.'
        )
      }
    } catch (err) {
      setErrorMsg(
        locale === 'hi'
          ? 'स्थान खोजने में त्रुटि हुई।'
          : 'Failed to search location. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setErrorMsg(
        locale === 'hi'
          ? 'आपके ब्राउज़र में GPS उपलब्ध नहीं है।'
          : 'Geolocation is not supported by your browser.'
      )
      return
    }

    setLocatingUser(true)
    setErrorMsg(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLocatingUser(false)
        onLocationSelect(
          latitude,
          longitude,
          locale === 'hi' ? 'मेरा वर्तमान स्थान (GPS)' : 'My Current Location (GPS)'
        )
      },
      (err) => {
        setLocatingUser(false)
        console.warn('Geolocation error:', err)
        setErrorMsg(
          locale === 'hi'
            ? 'GPS अनुमति अस्वीकृत या स्थान अनुपलब्ध।'
            : 'GPS permission denied or location unavailable.'
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div className="w-full flex flex-col gap-1.5">
      <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary shrink-0 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              locale === 'hi'
                ? 'कोई भी शहर, कस्बा, पिनकोड खोजें (उदा. झांसी, 284201, बांदा)...'
                : 'Search any city, town, pincode, or address everywhere...'
            }
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm flex items-center space-x-1.5 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {locale === 'hi' ? 'खोजें' : 'Search'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locatingUser}
          title={locale === 'hi' ? 'मेरा वर्तमान स्थान' : 'Use My Current Location'}
          className="px-3 py-2 border border-input bg-card hover:bg-muted text-foreground rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center space-x-1.5 shrink-0"
        >
          {locatingUser ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Navigation className="w-4 h-4 text-primary" />
          )}
          <span className="hidden md:inline">
            {locale === 'hi' ? 'मेरा स्थान (GPS)' : 'Locate Me'}
          </span>
        </button>
      </form>

      {/* Active Location Indicator / Error Message */}
      <div className="flex items-center justify-between text-[11px] px-1">
        {currentLocationName && (
          <div className="flex items-center text-muted-foreground truncate">
            <span className="font-medium mr-1 text-foreground">
              {locale === 'hi' ? 'सक्रिय स्थान:' : 'Active Reference:'}
            </span>
            <span className="text-primary font-semibold truncate">{currentLocationName}</span>
          </div>
        )}
        {errorMsg && (
          <span className="text-destructive font-medium ml-auto">{errorMsg}</span>
        )}
      </div>
    </div>
  )
}
