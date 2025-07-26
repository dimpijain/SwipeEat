const express = require('express');
const router = express.Router();
const axios = require('axios');
const verifyToken  = require('../middleware/verifyToken');
const Group = require('../models/Group');

// Google Places API configuration
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

router.get('/nearby', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.query;
    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    // Get group preferences
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Construct Google Places API request based on group preferences
    const { preferences } = group;
    const params = {
      key: GOOGLE_API_KEY,
      location: preferences.location || '40.7128,-74.0060', // Default to NYC
      radius: 1500, // 1.5km radius
      type: 'restaurant',
      opennow: true,
    };

    // Add cuisine filter if specified
    if (preferences.cuisine && preferences.cuisine.length > 0) {
      params.keyword = preferences.cuisine.join('|');
    }

    // Add price level filter if specified
    if (preferences.budget) {
      const priceMap = {
        'Low': '1',
        'Medium': '2,3',
        'High': '4'
      };
      params.maxprice = priceMap[preferences.budget] || '2,3';
    }

    const response = await axios.get(`${BASE_URL}/nearbysearch/json`, { params });
    
    // Format the response to include only needed data
    const restaurants = response.data.results.map(place => ({
      id: place.place_id,
      name: place.name,
      rating: place.rating,
      address: place.vicinity,
      photo: place.photos?.[0]?.photo_reference,
      priceLevel: place.price_level,
      types: place.types
    }));

    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

router.get('/details/:placeId', verifyToken, async (req, res) => {
  try {
    const { placeId } = req.params;
    const response = await axios.get(`${BASE_URL}/details/json`, {
      params: {
        key: GOOGLE_API_KEY,
        place_id: placeId,
        fields: 'name,rating,formatted_address,formatted_phone_number,website,opening_hours,photos,price_level'
      }
    });

    if (response.data.status !== 'OK') {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const details = response.data.result;
    res.json({
      name: details.name,
      rating: details.rating,
      address: details.formatted_address,
      phone: details.formatted_phone_number,
      website: details.website,
      openingHours: details.opening_hours?.weekday_text,
      photos: details.photos,
      priceLevel: details.price_level
    });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant details' });
  }
});

module.exports = router;