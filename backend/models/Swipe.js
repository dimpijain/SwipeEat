// models/Swipe.js
const mongoose = require('mongoose');

const SwipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  restaurantId: { type: String, required: true },  // Assuming restaurantId is a string (from API)
  direction: { type: String, enum: ['left', 'right'], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Swipe', SwipeSchema);
