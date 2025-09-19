const express = require('express');
const router = express.Router();
// Assuming your googleApiService.js is in a 'services' folder
const { getRestaurantDetails } = require('../services/googleApiService');
const verifyToken = require('../middleware/verifyToken');

// @route   GET /api/google/details/:placeId
// @desc    Get full details for a restaurant from Google Places API
// @access  Private
router.get('/details/:placeId', verifyToken, async (req, res) => {
  try {
    const { placeId } = req.params;
    if (!placeId) {
      return res.status(400).json({ message: 'Place ID is required.' });
    }

    const details = await getRestaurantDetails(placeId);
    res.json(details);
    
  } catch (error) {
    console.error('Error fetching Google Place details:', error);
    res.status(500).json({ message: 'Failed to fetch restaurant details.' });
  }
});

module.exports = router;