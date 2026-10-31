'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Compass,
  ExternalLink,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  RotateCcw,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { Lab, formatDistanceKm, getGoogleMapsDirectionsUrl } from '@labshare/shared'

interface InteractiveMapProps {
  labs: Array<Lab & { distanceKm?: number }>
  centerLat?: number
  centerLng?: number
  zoom?: number
  userLat?: number
  userLng?: number
  selectedLabId?: string
  onSelectLab?: (lab: Lab) => void
  height?: string
  locale?: 'en' | 'hi'
}

export function InteractiveMap({
  labs,
  centerLat = 25.4484,
  centerLng = 78.5685,
  zoom = 11,
  userLat,
  userLng,
  selectedLabId,
  onSelectLab,
  height = '520px',
  locale = 'en',
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap')
  const [activeLab, setActiveLab] = useState<(Lab & { distanceKm?: number }) | null>(null)
  const [mapReady, setMapReady] = useState(false)

  // Initialize Leaflet Map safely on client side
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return

    let isMounted = true

    // Dynamically import Leaflet to avoid SSR window errors
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: false,
      })

      // Add zoom control on bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Base tile layers
      const roadmapTiles = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Google Maps Directions',
          maxZoom: 19,
        }
      )

      const satelliteTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri, Earthstar Geographics | Google Maps Data',
          maxZoom: 18,
        }
      )

      if (mapType === 'satellite') {
        satelliteTiles.addTo(map)
      } else {
        roadmapTiles.addTo(map)
      }

      mapInstanceRef.current = map
      ;(map as any)._roadmapTiles = roadmapTiles
      ;(map as any)._satelliteTiles = satelliteTiles

      const markersGroup = L.layerGroup().addTo(map)
      markersLayerRef.current = markersGroup

      setMapReady(true)
    })

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Handle map type toggle (Roadmap vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !(map as any)._roadmapTiles) return

    if (mapType === 'satellite') {
      map.removeLayer((map as any)._roadmapTiles)
      map.addLayer((map as any)._satelliteTiles)
    } else {
      map.removeLayer((map as any)._satelliteTiles)
      map.addLayer((map as any)._roadmapTiles)
    }
  }, [mapType])

  // Pan to center if centerLat/centerLng changes
  useEffect(() => {
    if (mapInstanceRef.current && centerLat && centerLng) {
      mapInstanceRef.current.setView([centerLat, centerLng], zoom, {
        animate: true,
      })
    }
  }, [centerLat, centerLng, zoom])

  // Update markers whenever labs or user location changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !markersLayerRef.current) return

    import('leaflet').then((L) => {
      const markersGroup = markersLayerRef.current
      markersGroup.clearLayers()

      // 1. Add User Location Marker if available
      if (userLat && userLng) {
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75"></span>
              <div class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-lg items-center justify-center">
                <div class="h-2 w-2 rounded-full bg-white"></div>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(markersGroup)
        userMarker.bindTooltip(
          locale === 'hi' ? '📍 आपका वर्तमान स्थान' : '📍 Your Current Location',
          { permanent: false, direction: 'top' }
        )
      }

      // 2. Add Lab Markers
      const bounds = L.latLngBounds([])
      if (userLat && userLng) {
        bounds.extend([userLat, userLng])
      }

      labs.forEach((lab) => {
        const labLat = lab.lat || lab.organization?.lat
        const labLng = lab.lng || lab.organization?.lng
        if (!labLat || !labLng) return

        bounds.extend([labLat, labLng])

        const isSelected = selectedLabId === lab.id
        const pinColor = isSelected ? '#0f766e' : '#0284c7'

        const labIcon = L.divIcon({
          className: 'custom-lab-marker',
          html: `
            <div class="cursor-pointer transform hover:scale-110 transition-transform duration-200">
              <div class="flex items-center justify-center px-2 py-1 rounded-full text-white text-[11px] font-bold shadow-md border-2 ${
                isSelected ? 'border-amber-400 ring-2 ring-primary' : 'border-white'
              }" style="background-color: ${pinColor}">
                <span class="mr-1">${getLabEmoji(lab.type)}</span>
                <span class="max-w-[80px] truncate">${lab.name.split(' ')[0]}</span>
              </div>
              <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mx-auto" style="border-t-color: ${pinColor}"></div>
            </div>
          `,
          iconSize: [90, 36],
          iconAnchor: [45, 36],
        })

        const marker = L.marker([labLat, labLng], { icon: labIcon }).addTo(markersGroup)

        marker.on('click', () => {
          setActiveLab(lab)
          if (onSelectLab) onSelectLab(lab)
        })
      })

      // If we have selectedLabId, center on it
      if (selectedLabId) {
        const targetLab = labs.find((l) => l.id === selectedLabId)
        if (targetLab) {
          const lat = targetLab.lat || targetLab.organization?.lat
          const lng = targetLab.lng || targetLab.organization?.lng
          if (lat && lng) {
            mapInstanceRef.current.setView([lat, lng], 14, { animate: true })
            setActiveLab(targetLab)
          }
        }
      }
    })
  }, [labs, userLat, userLng, selectedLabId, mapReady, locale])

  function getLabEmoji(type: string): string {
    switch (type) {
      case 'SCIENCE_LAB':
        return '🔬'
      case 'COMPUTER_LAB':
        return '💻'
      case 'PROJECTOR_ROOM':
        return '📽️'
      case 'WORKSHOP':
        return '⚙️'
      case 'LIBRARY':
        return '📚'
      default:
        return '🏫'
    }
  }

  const handleResetView = () => {
    if (mapInstanceRef.current && centerLat && centerLng) {
      mapInstanceRef.current.setView([centerLat, centerLng], zoom, {
        animate: true,
      })
    }
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border shadow-md bg-card">
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
        {/* Layer Mode Toggle */}
        <div className="flex bg-card/90 backdrop-blur-md border border-input rounded-lg p-0.5 shadow-sm text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mapType === 'roadmap'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {locale === 'hi' ? 'मानचित्र' : 'Roadmap'}
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mapType === 'satellite'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {locale === 'hi' ? 'सैटेलाइट' : 'Satellite'}
          </button>
        </div>

        {/* Reset View Button */}
        <button
          type="button"
          onClick={handleResetView}
          title={locale === 'hi' ? 'दृश्य रीसेट करें' : 'Reset View'}
          className="p-1.5 bg-card/90 backdrop-blur-md border border-input rounded-lg shadow-sm hover:bg-muted text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Labs Count Pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-card/90 backdrop-blur-md border border-input rounded-lg shadow-sm text-xs font-bold text-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {labs.length} {locale === 'hi' ? 'लैब उपलब्ध' : 'Labs on Map'}
          </span>
        </div>
      </div>

      {/* Main Map Container */}
      <div ref={mapContainerRef} className="w-full" style={{ height }} />

      {/* Floating Selected Lab Card InfoWindow */}
      {activeLab && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-[1000] bg-card/95 backdrop-blur-md border border-border rounded-xl p-4 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex justify-between items-start mb-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
              {activeLab.type.replace('_', ' ')}
            </span>
            <button
              onClick={() => setActiveLab(null)}
              className="text-muted-foreground hover:text-foreground text-xs p-1"
            >
              ✕
            </button>
          </div>

          <h3 className="font-bold text-sm text-foreground leading-snug">
            {activeLab.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate mb-2">
            {activeLab.organization?.name} • {activeLab.organization?.district}
          </p>

          <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 my-2 border-y bg-muted/30 rounded-lg">
            <div>
              <span className="text-[10px] text-muted-foreground block">Distance</span>
              <span className="font-bold text-foreground">
                {activeLab.distanceKm !== undefined
                  ? formatDistanceKm(activeLab.distanceKm, locale)
                  : 'Near'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Capacity</span>
              <span className="font-bold text-foreground">{activeLab.capacity}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Trust</span>
              <span className="font-bold text-primary">{activeLab.trustScore}/100</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Link
              href={`/labs/${activeLab.id}`}
              className="flex-1 py-1.5 px-3 bg-primary text-white text-center rounded-lg text-xs font-bold hover:bg-primary-700 transition-colors shadow-sm"
            >
              {locale === 'hi' ? 'स्लॉट बुक करें' : 'View & Book'}
            </Link>

            {/* Turn-by-Turn Navigation via Google Maps */}
            <a
              href={getGoogleMapsDirectionsUrl(
                activeLab.lat || activeLab.organization?.lat || 25.4484,
                activeLab.lng || activeLab.organization?.lng || 78.5685,
                activeLab.name,
                userLat,
                userLng
              )}
              target="_blank"
              rel="noopener noreferrer"
              title={locale === 'hi' ? 'गूगल मैप्स में दिशा-निर्देश' : 'Directions in Google Maps'}
              className="py-1.5 px-3 border border-input bg-card hover:bg-muted text-foreground rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 text-primary" />
              <span>{locale === 'hi' ? 'दिशाएं' : 'Navigate'}</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
