// routes/swipes.js
const express = require('express');
const router = express.Router();
const Swipe = require('../models/Swipe');

// Middleware to verify JWT auth token, e.g. verifyToken (if using auth)
const verifyToken = require('../middleware/verifyToken');

router.post('/save', verifyToken, async (req, res) => {
  try {
    const { groupId, restaurantId, direction } = req.body;
    const userId = req.user.id;  // Extracted from verifyToken middleware

    if (!groupId || !restaurantId || !direction) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['left', 'right'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid direction value' });
    }

    const newSwipe = new Swipe({
      userId,
      groupId,
      restaurantId,
      direction
    });

    await newSwipe.save();

    return res.status(201).json({ message: 'Swipe saved successfully' });
  } catch (error) {
    console.error('Error saving swipe:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
