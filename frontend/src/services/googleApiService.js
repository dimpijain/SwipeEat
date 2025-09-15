import axios from 'axios';

// eslint-disable-next-line no-undef
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const NEARBY_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo';

// Helper to construct a photo URL from a photo reference
const getPhotoUrl = (photoReference, maxWidth = 400) => {
  if (!photoReference) return null;
  return `${PHOTO_URL}?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${API_KEY}`;
};

/**
 * Converts a location string (e.g., "Patiala, Punjab") into coordinates.
 * @param {string} location - The address or location name.
 * @returns {Promise<object>} A promise that resolves to { lat, lng }.
 */
export const getCoordinates = async (location) => {
  try {
    const response = await axios.get(GEOCODE_URL, {
      params: {
        address: location,
        key: API_KEY,
      },
    });
    if (response.data.status === 'OK') {
      return response.data.results[0].geometry.location; // { lat, lng }
    } else {
      throw new Error(response.data.status || 'Failed to geocode location');
    }
  } catch (error) {
    console.error('Geocoding API error:', error);
    throw new Error('Could not find coordinates for the specified location.');
  }
};

/**
 * Fetches nearby restaurants from the Google Places API.
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @param {number} radius - Search radius in kilometers.
 * @returns {Promise<Array>} A promise that resolves to an array of formatted restaurant objects.
 */
export const getNearbyRestaurants = async (lat, lng, radius) => {
  try {
    const response = await axios.get(NEARBY_SEARCH_URL, {
      params: {
        location: `${lat},${lng}`,
        radius: radius * 1000, // API expects radius in meters
        type: 'restaurant',
        key: API_KEY,
      },
    });

    if (response.data.status === 'OK') {
      // Map API data to the structure your component expects
      return response.data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        photo: place.photos ? getPhotoUrl(place.photos[0].photo_reference) : null,
        address: place.vicinity,
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        priceLevel: place.price_level,
        types: place.types,
      }));
    } else {
      throw new Error(response.data.status || 'Failed to fetch restaurants');
    }
  } catch (error) {
    console.error('Nearby Search API error:', error);
    throw new Error('Could not fetch nearby restaurants.');
  }
};

/**
 * Fetches detailed information for a specific restaurant using its Place ID.
 * @param {string} placeId - The Google Place ID for the restaurant.
 * @returns {Promise<object>} A promise that resolves to a detailed, formatted restaurant object.
 */
export const getRestaurantDetails = async (placeId) => {
  try {
    const response = await axios.get(PLACE_DETAILS_URL, {
      params: {
        place_id: placeId,
        fields: 'place_id,name,vicinity,rating,photos', // Specify fields to reduce cost
        key: API_KEY,
      },
    });

    if (response.data.status === 'OK') {
      const place = response.data.result;
      // Map API data to the structure your component expects
      return {
        id: place.place_id,
        name: place.name,
        photo: place.photos ? getPhotoUrl(place.photos[0].photo_reference) : null,
        address: place.vicinity,
        rating: place.rating,
      };
    } else {
      throw new Error(response.data.status || `Failed to fetch details for ${placeId}`);
    }
  } catch (error) {
    console.error(`Place Details API error for ${placeId}:`, error);
    // Return a fallback object so Promise.all doesn't fail completely
    return { id: placeId, name: 'Details not available', address: 'N/A', rating: 'N/A' };
  }
};