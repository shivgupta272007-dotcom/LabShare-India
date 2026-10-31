'use client'

import React, { useState } from 'react'
import { Compass, ExternalLink, Layers, MapPin, Navigation } from 'lucide-react'
import {
  formatDistanceKm,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
} from '@labshare/shared'

interface GoogleMapEmbedProps {
  lat: number
  lng: number
  title: string
  address?: string
  district?: string
  state?: string
  distanceKm?: number
  userLat?: number
  userLng?: number
  className?: string
  height?: string
  zoom?: number
  locale?: 'en' | 'hi'
}

export function GoogleMapEmbed({
  lat,
  lng,
  title,
  address,
  district,
  state,
  distanceKm,
  userLat,
  userLng,
  className = '',
  height = '320px',
  zoom = 15,
  locale = 'en',
}: GoogleMapEmbedProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap')

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Formulate the Google Maps Embed URL
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${lat},${lng}&maptype=${mapType}&zoom=${zoom}`
    : `https://maps.google.com/maps?q=${lat},${lng}&t=${mapType === 'satellite' ? 'k' : 'm'}&z=${zoom}&output=embed`

  const directionsUrl = getGoogleMapsDirectionsUrl(lat, lng, title, userLat, userLng)

  return (
    <div className={`flex flex-col rounded-xl overflow-hidden border bg-card shadow-sm ${className}`}>
      {/* Map Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b text-xs">
        <div className="flex items-center space-x-2 truncate">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span className="font-bold text-foreground truncate">{title}</span>
          {distanceKm !== undefined && (
            <span className="bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded text-[10px] shrink-0">
              {formatDistanceKm(distanceKm, locale)}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Satellite vs Roadmap Toggle */}
          <div className="flex rounded-md border bg-background p-0.5 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2 py-0.5 rounded ${
                mapType === 'roadmap'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {locale === 'hi' ? 'मानचित्र' : 'Map'}
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2 py-0.5 rounded ${
                mapType === 'satellite'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {locale === 'hi' ? 'सैटेलाइट' : 'Satellite'}
            </button>
          </div>

          {/* Deep link to Google Maps */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={locale === 'hi' ? 'गूगल मैप्स में दिशा-निर्देश प्राप्त करें' : 'Get Directions in Google Maps'}
            className="flex items-center space-x-1 px-2.5 py-1 bg-primary text-white rounded text-xs font-bold hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {locale === 'hi' ? 'गूगल मैप्स' : 'Google Maps'}
            </span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Embedded Map Frame */}
      <div className="relative w-full" style={{ height }}>
        <iframe
          title={`Google Map for ${title}`}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      </div>

      {/* Footer Address Info */}
      {(address || district || state) && (
        <div className="px-4 py-2.5 bg-muted/20 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">
            {[address, district, state].filter(Boolean).join(', ')}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
            {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
          </span>
        </div>
      )}
    </div>
  )
}
