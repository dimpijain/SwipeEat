const mongoose = require('mongoose');

const SwipeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group', 
    required: true 
  },
  restaurantId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 5; // Adjust based on your ID format
      },
      message: props => `${props.value} is not a valid restaurant ID!`
    }
  },
  direction: { 
    type: String, 
    enum: ['left', 'right'], 
    required: true,
    lowercase: true
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  }
}, {
  timestamps: true
});

// Indexes
SwipeSchema.index({ userId: 1, groupId: 1, restaurantId: 1 }, { unique: true });
SwipeSchema.index({ groupId: 1, restaurantId: 1 });
SwipeSchema.index({ userId: 1, timestamp: -1 });

// Virtuals
SwipeSchema.virtual('isRightSwipe').get(function() {
  return this.direction === 'right';
});

// Statics
SwipeSchema.statics.findByUserAndGroup = function(userId, groupId) {
  return this.find({ userId, groupId }).sort({ timestamp: -1 });
};

SwipeSchema.statics.countRightSwipes = function(groupId, restaurantId) {
  return this.countDocuments({ groupId, restaurantId, direction: 'right' });
};

// Transform
SwipeSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Swipe', SwipeSchema);