// ============================================================
// LabShare – Geolocation & Google Maps Integration Utilities
// Haversine distance, Google Maps deep links, Embed URLs, and Geocoding
// ============================================================

/**
 * Compute the great-circle distance between two points in kilometers
 * using the Haversine formula.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

/**
 * Format distance in a human-friendly bilingual format
 */
export function formatDistanceKm(distanceKm: number, locale: 'en' | 'hi' = 'en'): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000)
    return locale === 'hi' ? `${meters} मी` : `${meters} m`
  }
  return locale === 'hi' ? `${distanceKm} किमी` : `${distanceKm} km`
}

/**
 * Generate a Google Maps turn-by-turn directions URL
 * Opens directly in the Google Maps App on mobile or Web browser on desktop.
 */
export function getGoogleMapsDirectionsUrl(
  destinationLat: number,
  destinationLng: number,
  destinationName?: string,
  originLat?: number,
  originLng?: number
): string {
  const dest = `${destinationLat},${destinationLng}`
  const baseUrl = 'https://www.google.com/maps/dir/?api=1'
  const params = new URLSearchParams({
    destination: dest,
    travelmode: 'driving',
  })

  if (originLat !== undefined && originLng !== undefined) {
    params.set('origin', `${originLat},${originLng}`)
  }

  if (destinationName) {
    // Some Google Maps platforms accept destination_place_id or formatted query
    params.set('destination', `${destinationName}, ${dest}`)
  }

  return `${baseUrl}&${params.toString()}`
}

/**
 * Generate a Google Maps Place Search / View URL
 */
export function getGoogleMapsPlaceUrl(
  lat: number,
  lng: number,
  label?: string
): string {
  const query = label ? `${label} (${lat},${lng})` : `${lat},${lng}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/**
 * Generate an embeddable Google Maps URL (works with or without an API key)
 */
export function getGoogleMapsEmbedUrl(
  lat: number,
  lng: number,
  zoom = 15,
  apiKey?: string
): string {
  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${lat},${lng}&zoom=${zoom}`
  }
  // Universal keyless Google Maps embed fallback (standard iframe format)
  return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=${zoom}&output=embed`
}

/**
 * Asynchronously geocode a free-text location query (e.g., city, village, pincode)
 * Uses OpenStreetMap Nominatim with zero API key requirement, so it works everywhere!
 */
export async function geocodeLocationQuery(
  query: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  // Fast-path: Check if user typed coordinates like "25.3725, 78.7364"
  const coordMatch = trimmed.match(/^([-+]?[0-9]*\.?[0-9]+)[,\s]+([-+]?[0-9]*\.?[0-9]+)$/)
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1])
    const lng = parseFloat(coordMatch[2])
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        lat,
        lng,
        displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      }
    }
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed + ', India'
    )}&limit=1`
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'LabShare-Rural-School-Network/1.0',
      },
    })
    if (!res.ok) return null
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      }
    }
  } catch (err) {
    console.warn('Geocoding query failed:', err)
  }

  return null
}
