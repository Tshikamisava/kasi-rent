// OpenStreetMap Nominatim API for free geocoding
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Rate limiting - Nominatim requires 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Geocode an address to get latitude and longitude
 * @param {string} address - Full street address
 * @param {string} city - City name (fallback)
 * @returns {Promise<{lat: number, lon: number, address: string}|null>}
 */
export async function geocodeAddress(address, city) {
  try {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }
    lastRequestTime = Date.now();

    // Build search query - prefer full address, fallback to city
    const searchQuery = address || city;
    if (!searchQuery) {
      return null;
    }

    const params = new URLSearchParams({
      q: searchQuery,
      format: 'json',
      limit: '1',
      countrycodes: 'za', // South Africa
      addressdetails: '1'
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': 'KasiRent Property Rental Platform'
      }
    });

    if (!response.ok) {
      console.error('Geocoding API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.log('No geocoding results for:', searchQuery);
      return null;
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      display_name: result.display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Get coordinates for a city (fallback when no address provided)
 * @param {string} city - City name
 * @returns {Promise<{lat: number, lon: number}|null>}
 */
export async function geocodeCity(city) {
  return await geocodeAddress(null, city);
}
