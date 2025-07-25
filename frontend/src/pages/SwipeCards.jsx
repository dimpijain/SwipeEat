// SwipeCards.jsx
import React, { useState, useEffect, useMemo } from 'react';
import TinderCard from 'react-tinder-card';
import axios from 'axios';
import { Box, Card, CardContent, CardMedia, Typography, IconButton } from '@mui/material';
import { Close, Favorite } from '@mui/icons-material';

export default function SwipeCards() {
  const [restaurants, setRestaurants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/restaurant');
        setRestaurants(res.data);
        setCurrentIndex(res.data.length - 1);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      }
    };
    fetchRestaurants();
  }, []);

  const swiped = (direction, restaurantId, index) => {
    console.log(`Swiped ${direction} on ${restaurantId}`);
    setCurrentIndex(index - 1);
    // Optional: POST to backend for storing swipe action
  };

  const outOfFrame = (name) => {
    console.log(`${name} left the screen`);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative', width: '90vw', maxWidth: 400, height: '60vh' }}>
        {restaurants.map((restaurant, index) => (
          <TinderCard
            key={restaurant._id}
            onSwipe={(dir) => swiped(dir, restaurant._id, index)}
            onCardLeftScreen={() => outOfFrame(restaurant.name)}
            preventSwipe={['up', 'down']}
          >
            <Card sx={{ position: 'absolute', width: '100%', height: '100%' }}>
              <CardMedia
                component="img"
                height="200"
                image={restaurant.image}
                alt={restaurant.name}
              />
              <CardContent>
                <Typography variant="h6">{restaurant.name}</Typography>
                <Typography variant="body2" color="text.secondary">{restaurant.rating} ⭐</Typography>
              </CardContent>
            </Card>
          </TinderCard>
        ))}
      </Box>
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <IconButton size="large" color="error" onClick={() => swiped('left', restaurants[currentIndex]?._id, currentIndex)}>
          <Close fontSize="inherit" />
        </IconButton>
        <IconButton size="large" color="success" onClick={() => swiped('right', restaurants[currentIndex]?._id, currentIndex)}>
          <Favorite fontSize="inherit" />
        </IconButton>
      </Box>
    </Box>
  );
}
