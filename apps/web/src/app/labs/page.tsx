'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Award,
  Calendar,
  Check,
  Compass,
  ExternalLink,
  Filter,
  Grid,
  Layers,
  Map as MapIcon,
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  Sparkles,
  Split,
  Star,
  Users,
} from 'lucide-react'
import { useLanguage } from '../../context/language-context'
import { useAuth } from '../../context/auth-context'
import {
  BUNDELKHAND_DISTRICTS,
  Lab,
  LabType,
  formatDistanceKm,
  getGoogleMapsDirectionsUrl,
  haversineDistanceKm,
} from '@labshare/shared'
import { LocationSearchBar } from '../../components/maps/location-search-bar'
import { getDefaultLabPhotos } from '../../components/labs/photo-gallery'

// Dynamically import InteractiveMap with SSR disabled to prevent Leaflet window errors
const InteractiveMap = dynamic(
  () =>
    import('../../components/maps/interactive-map').then(
      (mod) => mod.InteractiveMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[480px] bg-muted/40 rounded-2xl flex items-center justify-center animate-pulse border">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-primary mx-auto mb-2 animate-bounce" />
          <p className="text-xs font-semibold text-muted-foreground">
            Loading Google Maps & Labs Network...
          </p>
        </div>
      </div>
    ),
  }
)

export default function LabsSearchPage() {
  const { locale, t } = useLanguage()
  const { client } = useAuth()

  const [labs, setLabs] = useState<Array<Lab & { distanceKm?: number }>>([])
  const [loading, setLoading] = useState(true)

  // Reference coordinates for distance calculation (defaults to Delhi NCR)
  const [activeLat, setActiveLat] = useState<number>(28.6139)
  const [activeLng, setActiveLng] = useState<number>(77.2090)
  const [activeLocationName, setActiveLocationName] = useState<string>(
    'Delhi NCR'
  )
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(50)
  const [userGpsCoords, setUserGpsCoords] = useState<{
    lat: number
    lng: number
  } | null>(null)

  // Filters & Display
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [minCapacity, setMinCapacity] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>('distance')
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'grid'>('split')
  const [selectedLabId, setSelectedLabId] = useState<string | undefined>()

  useEffect(() => {
    setLoading(true)
    client.labs
      .search({
        type: selectedType || undefined,
        district: selectedDistrict || undefined,
        city: activeLocationName || undefined,
        minCapacity: minCapacity || undefined,
        lat: activeLat,
        lng: activeLng,
        radiusKm: selectedRadiusKm,
        sortBy,
      })
      .then((data) => {
        // Compute precise distance client-side as well
        const withDistances = data.map((lab) => {
          const lLat = lab.lat || lab.organization?.lat
          const lLng = lab.lng || lab.organization?.lng
          const dKm =
            lLat && lLng
              ? haversineDistanceKm(activeLat, activeLng, lLat, lLng)
              : undefined
          return {
            ...lab,
            distanceKm: dKm,
          }
        })

        // Sort by distance if selected
        if (sortBy === 'distance') {
          withDistances.sort(
            (a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999)
          )
        }
        setLabs(withDistances)
      })
      .catch((err) => console.error('Failed to load labs:', err))
      .finally(() => setLoading(false))
  }, [client, selectedType, selectedDistrict, minCapacity, sortBy, activeLat, activeLng, selectedRadiusKm, activeLocationName])

  const handleLocationChange = (lat: number, lng: number, label: string) => {
    setActiveLat(lat)
    setActiveLng(lng)
    setActiveLocationName(label)
    if (label.includes('GPS')) {
      setUserGpsCoords({ lat, lng })
    }
  }

  const labTypes: Array<{ key: string; labelEn: string; labelHi: string }> = [
    { key: '', labelEn: 'All Labs', labelHi: 'सभी लैब' },
    { key: 'SCIENCE_LAB', labelEn: 'Science Lab', labelHi: 'विज्ञान' },
    { key: 'COMPUTER_LAB', labelEn: 'Computer Lab', labelHi: 'कंप्यूटर' },
    { key: 'PROJECTOR_ROOM', labelEn: 'Projector / AV', labelHi: 'प्रोजेक्टर' },
    { key: 'WORKSHOP', labelEn: 'Robotics Workshop', labelHi: 'रोबोटिक्स' },
    { key: 'LIBRARY', labelEn: 'Reference Library', labelHi: 'पुस्तकालय' },
  ]

  return (
    <div className="container py-8 flex flex-col gap-6">
      {/* Header & Mission */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span>
              {locale === 'en'
                ? 'Google Maps Geolocation & Smart Distance Search'
                : 'गूगल मैप्स जियोलोकेशन एवं स्मार्ट दूरी खोज'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {locale === 'en'
              ? 'Discover Nearby School Labs'
              : 'पास की स्कूल लैब खोजें'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            {locale === 'en'
              ? 'Locate verified Navodaya & private school labs anywhere. Turn-by-turn Google Maps navigation and real-time availability.'
              : 'नवोदय और निजी स्कूलों की प्रयोगशालाएं खोजें। गूगल मैप्स नेविगेशन और लाइव उपलब्धता के साथ।'}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center rounded-lg border bg-card p-1 shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              viewMode === 'split'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {locale === 'en' ? 'Split View' : 'विभाजित'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              viewMode === 'map'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {locale === 'en' ? 'Map View' : 'मानचित्र'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {locale === 'en' ? 'Cards View' : 'कार्ड्स'}
            </span>
          </button>
        </div>
      </div>

      {/* Global Location & Pincode Search Bar */}
      <div className="bg-card border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4">
        <LocationSearchBar
          onLocationSelect={handleLocationChange}
          currentLocationName={activeLocationName}
          selectedRadiusKm={selectedRadiusKm}
          onRadiusChange={setSelectedRadiusKm}
          locale={locale}
        />

        {/* Filter Pills & Dropdowns */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between pt-3 border-t">
          {/* Lab Type Pills */}
          <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
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

          {/* District & Sort Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* District Selector */}
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-muted-foreground font-medium">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="text-xs rounded-md border bg-background px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-primary"
              >
                <option value="">All Regions / सभी जिले</option>
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
                <option value="distance">Distance (Nearest First)</option>
                <option value="trust">Trust Score</option>
                <option value="rating">Host Rating</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Split View vs Full Map vs Cards */}
      {viewMode === 'map' ? (
        /* Full Map View */
        <div className="w-full">
          <InteractiveMap
            labs={labs}
            centerLat={activeLat}
            centerLng={activeLng}
            userLat={userGpsCoords?.lat}
            userLng={userGpsCoords?.lng}
            selectedLabId={selectedLabId}
            onSelectLab={(l) => setSelectedLabId(l.id)}
            height="620px"
            locale={locale}
          />
        </div>
      ) : viewMode === 'split' ? (
        /* Split View: Map + Cards side-by-side or stacked */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Map (5 Cols on Desktop) */}
          <div className="lg:col-span-5 order-2 lg:order-1 sticky top-20">
            <InteractiveMap
              labs={labs}
              centerLat={activeLat}
              centerLng={activeLng}
              userLat={userGpsCoords?.lat}
              userLng={userGpsCoords?.lng}
              selectedLabId={selectedLabId}
              onSelectLab={(l) => setSelectedLabId(l.id)}
              height="580px"
              locale={locale}
            />
          </div>

          {/* Cards List (7 Cols on Desktop) */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-card border rounded-xl p-5 h-44 animate-pulse"
                  />
                ))}
              </div>
            ) : labs.length === 0 ? (
              <div className="text-center py-16 bg-card border rounded-xl p-8">
                <p className="text-sm font-semibold text-muted-foreground">
                  {locale === 'en'
                    ? 'No labs match the selected filter criteria. Try expanding distance or clearing filters.'
                    : 'कोई लैब नहीं मिली। कृपया फ़िल्टर बदलें।'}
                </p>
              </div>
            ) : (
              labs.map((lab) => (
                <LabCard
                  key={lab.id}
                  lab={lab}
                  isSelected={selectedLabId === lab.id}
                  onHover={() => setSelectedLabId(lab.id)}
                  userLat={userGpsCoords?.lat || activeLat}
                  userLng={userGpsCoords?.lng || activeLng}
                  locale={locale}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        /* Grid View: 3-Column Cards */
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-card border rounded-xl p-5 h-64 animate-pulse"
                />
              ))}
            </div>
          ) : labs.length === 0 ? (
            <div className="text-center py-16 bg-card border rounded-xl p-8">
              <p className="text-sm font-semibold text-muted-foreground">
                {locale === 'en'
                  ? 'No labs match the selected filter criteria.'
                  : 'कोई लैब उपलब्ध नहीं है।'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {labs.map((lab) => (
                <LabCard
                  key={lab.id}
                  lab={lab}
                  isSelected={selectedLabId === lab.id}
                  onHover={() => setSelectedLabId(lab.id)}
                  userLat={userGpsCoords?.lat || activeLat}
                  userLng={userGpsCoords?.lng || activeLng}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LabCard({
  lab,
  isSelected,
  onHover,
  userLat,
  userLng,
  locale,
}: {
  lab: Lab & { distanceKm?: number }
  isSelected: boolean
  onHover: () => void
  userLat?: number
  userLng?: number
  locale: 'en' | 'hi'
}) {
  const labLat = lab.lat || lab.organization?.lat || 25.4484
  const labLng = lab.lng || lab.organization?.lng || 78.5685
  const directionsUrl = getGoogleMapsDirectionsUrl(
    labLat,
    labLng,
    lab.name,
    userLat,
    userLng
  )

  const photoUrl =
    lab.photos?.[0]?.url || getDefaultLabPhotos(lab.type, lab.name)[0]?.url

  return (
    <div
      onMouseEnter={onHover}
      className={`group bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${
        isSelected ? 'ring-2 ring-primary border-primary shadow-lg' : ''
      }`}
    >
      <div>
        {/* Photo Header with Overlay */}
        <div className="relative w-full h-44 overflow-hidden bg-slate-900">
          <img
            src={photoUrl}
            alt={lab.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Floating Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
              {lab.type.replace('_', ' ')}
            </span>
            <div className="flex items-center space-x-1 text-xs font-bold text-amber-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{lab.averageRating || 4.9}</span>
            </div>
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-2.5 left-3 right-3 z-10 text-white">
            <h2 className="font-bold text-sm sm:text-base leading-snug drop-shadow-md truncate">
              {lab.name}
            </h2>
            <div className="flex items-center text-[11px] text-slate-300 drop-shadow-sm mt-0.5">
              <MapPin className="w-3 h-3 mr-1 text-primary-400 shrink-0" />
              <span className="truncate">
                {lab.organization?.name || 'School'} • {lab.organization?.district}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
            {lab.description}
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t bg-muted/20 -mx-4 -mb-4 px-4 py-2.5">
            <div>
              <div className="text-muted-foreground text-[10px]">Distance</div>
              <div className="font-bold text-foreground">
                {lab.distanceKm !== undefined
                  ? formatDistanceKm(lab.distanceKm, locale)
                  : 'Near'}
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
      </div>

      <div className="p-4 bg-muted/40 border-t flex justify-between items-center gap-2">
        {/* Google Maps Turn-by-Turn Navigation */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={
            locale === 'hi'
              ? 'गूगल मैप्स में दिशा-निर्देश'
              : 'Directions on Google Maps'
          }
          className="px-3 py-1.5 rounded-md border border-input bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5 text-primary" />
          <span>{locale === 'hi' ? 'गूगल मैप्स' : 'Google Maps'}</span>
          <ExternalLink className="w-3 h-3 text-muted-foreground" />
        </a>

        <Link
          href={`/labs/${lab.id}`}
          className="px-3.5 py-1.5 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary-700 transition-colors shadow-sm"
        >
          {locale === 'en' ? 'Check Slots' : 'स्लॉट देखें'}
        </Link>
      </div>
    </div>
  )
}
