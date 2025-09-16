export interface LocationLookupResult {
  latitude: number
  longitude: number
  city?: string
  region?: string
  country?: string
}

export async function lookupLocationFromIp(): Promise<LocationLookupResult | null> {
  try {
    const response = await fetch('https://ipapi.co/json/')
    if (!response.ok) {
      return null
    }

    const data = await response.json()

    const latitude = Number(data.latitude)
    const longitude = Number(data.longitude)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null
    }

    return {
      latitude,
      longitude,
      city: typeof data.city === 'string' ? data.city : undefined,
      region: typeof data.region === 'string' ? data.region : undefined,
      country: typeof data.country_name === 'string' ? data.country_name : undefined
    }
  } catch (error) {
    console.warn('Location lookup failed', error)
    return null
  }
}
