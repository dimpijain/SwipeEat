const mongoose=require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  preferences: {
    budget: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    cuisine: {
      type: [String], // e.g., ['Chinese', 'Indian']
      default: [],
    },
    location: {
      type: String,
      default: '',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



module.exports= mongoose.model('Group', groupSchema);
