require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/SwipeEat';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Routes will be added here later

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const groupRoutes = require('./routes/group');
app.use('/api/group', groupRoutes);

// const swipesRoute = require('./routes/swipes');
// app.use('/api/swipe', swipesRoute);

const restaurant=require('./routes/restaurants');
app.use('/api/restaurants',restaurant);

const swipes = require('./routes/swipes');
app.use('/api/swipes', swipes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
