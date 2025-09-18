import axios from 'axios';

// Get the API key from your frontend's .env file
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Use the Vite proxy paths for API calls
const GEOCODE_URL = '/gmaps/maps/api/geocode/json';
const NEARBY_SEARCH_URL = '/gmaps/maps/api/place/nearbysearch/json';
const PLACE_DETAILS_URL = '/gmaps/maps/api/place/details/json';

/**
 * Helper function to construct a full, direct URL for a Google Place photo.
 * This is used for <img> tags and doesn't need the proxy.
 * @param {string} photoReference - The photo reference string from the Places API.
 * @returns {string|null} The full photo URL or null.
 */
const getPhotoUrl = (photoReference) => {
  if (!photoReference) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${API_KEY}`;
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
      return response.data.results[0].geometry.location; // Returns { lat, lng }
    } else {
      throw new Error(response.data.error_message || `Geocoding failed: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Geocoding API error:', error);
    throw new Error('Could not find coordinates for the specified location.');
  }
};

/**
 * Fetches nearby restaurants using coordinates.
 * @param {string} location - The location string (e.g., "Patiala, Punjab").
 * @param {number} radius - The search radius in kilometers.
 * @returns {Promise<Array>} A promise that resolves to an array of formatted restaurant objects.
 */
export const getNearbyRestaurants = async (location, radius) => {
  try {
    // Step 1: Convert location name to coordinates
    const { lat, lng } = await getCoordinates(location);

    // Step 2: Use coordinates to find nearby restaurants
    const response = await axios.get(NEARBY_SEARCH_URL, {
      params: {
        location: `${lat},${lng}`,
        radius: radius * 1000, // API expects radius in meters
        type: 'restaurant',
        key: API_KEY,
      },
    });

    if (response.data.status === 'OK') {
      // Map the raw API data to the format our app expects
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
      throw new Error(response.data.error_message || `Nearby Search failed: ${response.data.status}`);
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
    return { id: placeId, name: 'Details not available', address: 'N/A', rating: 'N/A' };
  }
};