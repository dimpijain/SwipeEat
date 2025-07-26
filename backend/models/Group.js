const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  preferences: {
    budget: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    cuisine: [{
      type: String,
      enum: ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai']
    }],
    location: String
  },
  joinCode: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    minlength: 6,
    maxlength: 6
  },
  matchedRestaurants: [{ // <-- ADD THIS FIELD
        type: String, // Google Place ID
        
    }]
}, { timestamps: true });

// Indexes for better performance
groupSchema.index({ joinCode: 1 }, { unique: true });
groupSchema.index({ createdBy: 1 });
groupSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Group', groupSchema);
