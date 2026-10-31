'use client'

import React, { useState } from 'react'
import {
  Compass,
  Globe2,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import {
  INDIAN_STATES,
  IndianCity,
  MAJOR_INDIAN_CITIES,
  geocodeLocationQuery,
} from '@labshare/shared'

interface LocationSearchBarProps {
  onLocationSelect: (lat: number, lng: number, label: string) => void
  currentLocationName?: string
  selectedRadiusKm?: number
  onRadiusChange?: (radiusKm: number) => void
  locale?: 'en' | 'hi'
}

export function LocationSearchBar({
  onLocationSelect,
  currentLocationName,
  selectedRadiusKm = 50,
  onRadiusChange,
  locale = 'en',
}: LocationSearchBarProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [locatingUser, setLocatingUser] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string>('')

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
          locale === 'hi'
            ? 'मेरा वर्तमान स्थान (GPS Live)'
            : 'My Current Location (GPS Live)'
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

  const handleCityClick = (city: IndianCity) => {
    onLocationSelect(
      city.lat,
      city.lng,
      `${city.name}, ${city.state}`
    )
  }

  const handleStateChange = async (stateName: string) => {
    setSelectedState(stateName)
    if (!stateName) return

    // Find if we have a major city in this state
    const matchedCity = MAJOR_INDIAN_CITIES.find(
      (c) => c.state.toLowerCase() === stateName.toLowerCase()
    )
    if (matchedCity) {
      onLocationSelect(
        matchedCity.lat,
        matchedCity.lng,
        `${matchedCity.name}, ${stateName}`
      )
    } else {
      // Geocode the state name
      setLoading(true)
      try {
        const res = await geocodeLocationQuery(`${stateName}, India`)
        if (res) {
          onLocationSelect(res.lat, res.lng, `${stateName}, India`)
        }
      } catch (err) {
        console.warn('State geocoding error:', err)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Main Search Input & GPS Controls */}
      <div className="flex flex-col md:flex-row gap-2.5 items-center w-full">
        {/* Text Input with Search */}
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary shrink-0 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              locale === 'hi'
                ? 'भारत का कोई भी शहर, कस्बा या पिनकोड खोजें (उदा. पटना, जयपुर, बेंगलुरु)...'
                : 'Enter ANY city, district, village, or pincode across India...'
            }
            className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm flex items-center space-x-1"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>{locale === 'hi' ? 'खोजें' : 'Search'}</span>
          </button>
        </form>

        {/* Secondary Row: 2-Col Grid on Phones, Flex on Tablets/Desktops */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex items-center gap-2 w-full md:w-auto">
          {/* GPS Locate Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            title={
              locale === 'hi'
                ? 'मेरा वर्तमान स्थान (GPS)'
                : 'Detect My Location via GPS'
            }
            className="w-full md:w-auto px-3.5 py-2.5 border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 shrink-0"
          >
            {locatingUser ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Navigation className="w-4 h-4 text-primary animate-pulse" />
            )}
            <span className="truncate">{locale === 'hi' ? 'स्थान (GPS)' : 'Locate Me'}</span>
          </button>

          {/* State Selector Dropdown */}
          <div className="w-full md:w-44 shrink-0">
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full text-xs rounded-xl border border-input bg-background px-2.5 py-2.5 font-medium focus:ring-2 focus:ring-primary shadow-sm truncate"
            >
              <option value="">{locale === 'hi' ? 'सभी राज्य' : 'Select State / UT'}</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Radius Selector */}
          {onRadiusChange && (
            <div className="col-span-2 sm:col-span-1 w-full md:w-36 shrink-0">
              <select
                value={selectedRadiusKm}
                onChange={(e) => onRadiusChange(parseInt(e.target.value, 10))}
                className="w-full text-xs rounded-xl border border-input bg-background px-2.5 py-2.5 font-medium focus:ring-2 focus:ring-primary shadow-sm"
              >
                <option value="15">Within 15 km</option>
                <option value="30">Within 30 km</option>
                <option value="50">Within 50 km</option>
                <option value="100">Within 100 km</option>
                <option value="250">Within 250 km</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Quick City Selector Bar (Touch Momentum Scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin touch-pan-x overscroll-x-contain">
        <span className="text-[11px] font-bold text-muted-foreground shrink-0 mr-1 flex items-center space-x-1">
          <Globe2 className="w-3 h-3 text-primary" />
          <span>{locale === 'hi' ? 'प्रमुख शहर:' : 'Quick Cities:'}</span>
        </span>
        {MAJOR_INDIAN_CITIES.slice(0, 14).map((city) => {
          const isSelected =
            currentLocationName?.toLowerCase().includes(city.name.toLowerCase())
          return (
            <button
              key={city.name}
              type="button"
              onClick={() => handleCityClick(city)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-primary text-white shadow-sm ring-1 ring-primary'
                  : 'bg-muted/70 hover:bg-muted text-foreground'
              }`}
            >
              {locale === 'hi' ? city.displayNameHi : city.name}
            </button>
          )
        })}
      </div>

      {/* Active Location Indicator / Status */}
      <div className="flex items-center justify-between text-xs px-1 border-t pt-2">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="text-muted-foreground font-medium">
            {locale === 'hi' ? 'सक्रिय स्थान केंद्र:' : 'Active Location Center:'}
          </span>
          <span className="text-primary font-bold truncate">
            {currentLocationName || 'All India Network'}
          </span>
        </div>
        {errorMsg ? (
          <span className="text-destructive font-medium ml-2 text-[11px]">{errorMsg}</span>
        ) : (
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{locale === 'hi' ? 'सत्यापित लैब नेटवर्क सक्रिय' : 'Live Proximity Active'}</span>
          </span>
        )}
      </div>
    </div>
  )
}
