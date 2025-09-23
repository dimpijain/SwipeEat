const express = require('express');
const router = express.Router();
const verifyToken  = require('../middleware/verifyToken');
const Group = require('../models/Group');
const { getNearbyRestaurants, getRestaurantDetails } = require('../services/googleApiService');

// GET nearby restaurants for a specific group
router.get('/for-group/:groupId', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    if (!group.location || !group.radius) {
      return res.status(400).json({ message: 'Group location and radius are required.' });
    }
    const restaurants = await getNearbyRestaurants(group.location, group.radius);
    res.json(restaurants);
  } catch (error) {
    console.error('Error in /for-group route:', error);
    res.status(500).json({ message: 'Failed to fetch nearby restaurants' });
  }
});

// GET full details for a specific restaurant by its Place ID
router.get('/details/:placeId', verifyToken, async (req, res) => {
  try {
    const { placeId } = req.params;
    const details = await getRestaurantDetails(placeId);
    res.json(details);
  } catch (error) {
    console.error('Error in /details route:', error);
    res.status(500).json({ message: 'Failed to fetch restaurant details' });
  }
});

module.exports = router;