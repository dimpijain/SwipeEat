const axios = require('axios');

// Your API key should be in your backend's .env file
const API_KEY = process.env.GOOGLE_API_KEY;

/**
 * Helper function to construct a full URL for a Google Place photo.
 * @param {string} photoReference - The photo reference string from the Places API.
 * @returns {string|null} The full photo URL or null if no reference is provided.
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
const getCoordinates = async (location) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: location,
        key: API_KEY,
      },
    });
    if (response.data.status === 'OK') {
      return response.data.results[0].geometry.location; // Returns { lat, lng }
    } else {
      throw new Error(response.data.error_message || `Geocoding failed with status: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Geocoding API error:', error.message);
    throw new Error('Could not find coordinates for the specified location.');
  }
};

/**
 * Fetches nearby restaurants from the Google Places API based on a location string and radius.
 * @param {string} location - The location string (e.g., "Patiala, Punjab").
 * @param {number} radius - The search radius in kilometers.
 * @returns {Promise<Array>} A promise that resolves to an array of formatted restaurant objects.
 */
const getNearbyRestaurants = async (location, radius) => {
  try {
    // First, get the coordinates for the location string
    const { lat, lng } = await getCoordinates(location);

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
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
      throw new Error(response.data.error_message || `Nearby Search failed with status: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Nearby Restaurants service error:', error.message);
    throw new Error('Could not fetch nearby restaurants.');
  }
};

module.exports = {
  getNearbyRestaurants,
  getCoordinates,
};