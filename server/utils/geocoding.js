// Free geocoding using OpenStreetMap Nominatim API
// Respects usage policy: max 1 request/second

export const geocodeAddress = async (address, location) => {
  try {
    // Combine address with location for better results (e.g., "123 Main St, Pretoria, South Africa")
    const searchQuery = `${address}, ${location}, South Africa`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Using Nominatim API with proper user agent
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&countrycodes=za`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'KasiRent/1.0 (Property Rental Platform)',
      },
    });

    if (!response.ok) {
      console.error('Geocoding API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Reverse geocoding - convert coordinates to address
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'KasiRent/1.0 (Property Rental Platform)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data && data.address) {
      return {
        address: data.display_name,
        city: data.address.city || data.address.town || data.address.village,
        suburb: data.address.suburb,
        postcode: data.address.postcode,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};
