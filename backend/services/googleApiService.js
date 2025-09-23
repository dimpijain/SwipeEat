const axios = require('axios');

const API_KEY = process.env.GOOGLE_API_KEY;

const getPhotoUrl = (photoReference) => {
  if (!photoReference) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${API_KEY}`;
};

const getCoordinates = async (location) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address: location, key: API_KEY },
    });
    if (response.data.status === 'OK') {
      return response.data.results[0].geometry.location;
    } else {
      throw new Error(response.data.error_message || `Geocoding failed with status: ${response.data.status}`);
    }
  } catch (error) {
    throw new Error('Could not find coordinates for the specified location.');
  }
};

const getNearbyRestaurants = async (location, radius) => {
  try {
    const { lat, lng } = await getCoordinates(location);
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius: radius * 1000,
        type: 'restaurant',
        key: API_KEY,
      },
    });

    if (response.data.status === 'OK') {
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
    throw new Error('Could not fetch nearby restaurants.');
  }
};

// ✅ ADDED: Function to get full restaurant details
const getRestaurantDetails = async (placeId) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        fields: 'name,rating,formatted_address,formatted_phone_number,website,opening_hours,photos,price_level,user_ratings_total,types',
        key: API_KEY,
      },
    });

    if (response.data.status === 'OK') {
      const place = response.data.result;
      return {
        id: place.place_id,
        name: place.name,
        photo: place.photos ? getPhotoUrl(place.photos[0].photo_reference) : null,
        address: place.formatted_address,
        rating: place.rating,
        phoneNumber: place.formatted_phone_number,
        website: place.website,
        openingHours: place.opening_hours?.weekday_text,
        priceLevel: place.price_level,
        userRatingsTotal: place.user_ratings_total,
        types: place.types,
      };
    } else {
      throw new Error(response.data.error_message || `Place Details failed`);
    }
  } catch (error) {
    throw new Error(`Could not fetch details for restaurant ${placeId}.`);
  }
};

module.exports = {
  getNearbyRestaurants,
  getCoordinates,
  getRestaurantDetails, 
};