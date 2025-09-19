const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required.'],
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    type: String,
    required: [true, 'Location is required for restaurant searches.'],
    trim: true
  },
  radius: {
    type: Number,
    required: [true, 'Search radius is required.'],
    min: 1,
    max: 50
  },
  cuisinePreferences: [{
    type: String
  }],
  // ✅ ADDED: A new field to store the date of the event.
  eventDate: {
    type: Date,
    required: false
  },
  joinCode: {
    type: String,
    required: true,
    uppercase: true,
    minlength: 6,
    maxlength: 6
  },
  matchedRestaurants: [{
    type: String, // Stores Google Place IDs
  }]
}, { timestamps: true });

// Indexes for better query performance
groupSchema.index({ joinCode: 1 }, { unique: true });
groupSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Group', groupSchema);