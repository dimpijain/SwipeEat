import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import axios from 'axios';
import {
  Box, Card, CardMedia, CardContent, Typography,
  Container, IconButton, Chip, Divider, Button,
  Paper, CircularProgress, Alert
} from '@mui/material';
import {
  Close, Favorite, ArrowBack,
  Star, LocationOn, Phone, Language, Schedule
} from '@mui/icons-material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { jwtDecode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import mockRestaurants from '../mockRestaurants';

const COLORS = {
  primary: '#FF7F7F',
  secondary: '#FFD6B0',
  background: '#FFF9FA',
  textPrimary: '#575761',
  cardBackground: '#FFF5F8',
  sidebarBackground: '#FFEDE7',
  accent: '#B5EAD7'
};

const RestaurantSwipe = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [db, setDb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [token, setToken] = useState('');
  const [swipedRestaurants, setSwipedRestaurants] = useState(new Set());

  const currentIndexRef = useRef(currentIndex);
  // Ensure childRefs is always sized correctly to the current db length
  const childRefs = useRef([]);

  useEffect(() => {
    // Update childRefs when db changes
    childRefs.current = Array(db.length).fill(0).map((_, i) => childRefs.current[i] || React.createRef());
  }, [db]);


  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login');
      return;
    }
    setToken(storedToken);
  }, [navigate]);

  useEffect(() => {
    if (!token || !groupId) return;

    const loadMockRestaurants = () => {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        // Filter out already swiped restaurants from mock data
        const filteredRestaurants = mockRestaurants.filter(
          restaurant => !swipedRestaurants.has(restaurant.id)
        );

        // TinderCard expects the array to be in reverse order for correct stacking
        // and to swipe from the top (last element)
        const reversedRestaurants = [...filteredRestaurants].reverse();

        if (reversedRestaurants.length > 0) {
          setDb(reversedRestaurants);
          setCurrentIndex(reversedRestaurants.length - 1); // Index of the top card
        } else {
          setDb([]);
          setCurrentIndex(-1);
        }
        setLoading(false);
      }, 500);
    };

    loadMockRestaurants();
  }, [groupId, token, swipedRestaurants]); // Depend on swipedRestaurants to reload when a swipe is registered

  // This is called by TinderCard when the card leaves the screen
  const outOfFrame = useCallback((id) => {
    console.log(`${id} left the screen!`);
    // This is primarily for cleanup or final state update after animation
    // The state for swiped restaurants should ideally be updated after successful API call
  }, []);

  // Main swipe logic, called by buttons or by TinderCard's onSwipe
  const swipe = useCallback(async (dir, manualSwipe = false) => {
    const targetIndex = currentIndexRef.current; // Get the current index from the ref

    if (targetIndex < 0 || !db[targetIndex] || !childRefs.current[targetIndex]?.current) {
      console.log('No more cards to swipe or invalid target index.');
      return;
    }

    const restaurantToSwipe = db[targetIndex];

    try {
      // Only programmatically swipe if it's not a user-initiated swipe from the card itself
      if (!manualSwipe) {
          await childRefs.current[targetIndex].current.swipe(dir);
      }
      setLastDirection(dir);

      const response = await axios.post(
        'http://localhost:5000/api/swipes/save',
        {
          groupId,
          restaurantId: restaurantToSwipe.id,
          direction: dir === 'right' ? 'right' : 'left'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // If swipe is successful or already exists (409)
      if (response.status === 201 || response.status === 409) {
        setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
        // Only decrement currentIndex if the swipe was truly processed (new or already existing)
        setCurrentIndex(prevIndex => prevIndex - 1);
        console.log(`Successfully processed swipe for ${restaurantToSwipe.name}`);
      } else {
        // This case should ideally be caught by the catch block, but as a fallback
        toast.error(`Unexpected response status: ${response.status}. Failed to save swipe.`, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true
        });
      }
    } catch (err) {
      console.error('Swipe error:', err);
      // Only show error toast for actual errors (not 409 which is handled above)
      if (err.response && err.response.status === 409) {
          console.log(`Restaurant ${restaurantToSwipe.name} already swiped.`);
          setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
          setCurrentIndex(prevIndex => prevIndex - 1);
      } else {
          toast.error(`Failed to save swipe. ${err.response?.data?.error || err.message || ''}`, {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: true
          });
      }
    }
  }, [groupId, db, token]); // Removed childRefs from dependencies as it's a ref, not state

  const handleSwipeButton = (dir) => {
    // When buttons are clicked, it's a manual swipe, so we programmatically swipe the card
    swipe(dir, true);
  };

  const handleCardSwipedByUser = useCallback((dir) => {
    // When the user physically swipes the card, this callback is triggered.
    // We already have the 'dir' and don't need to programmatically swipe again.
    // We pass true to indicate it's a manual swipe, so the internal `childRefs.current[targetIndex].current.swipe(dir)` is skipped.
    swipe(dir, true);
  }, [swipe]);


  const handleCardClick = (restaurant) => {
    setCurrentRestaurant(restaurant);
    setShowDetails(true);
  };

  const handleBackToSwipe = () => {
    setShowDetails(false);
    setCurrentRestaurant(null);
  };

  const getPriceLevel = (level) => {
    if (!level) return '';
    return '$'.repeat(level);
  };

  // ... (keep your existing error, loading, and details view code)

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: COLORS.background,
      position: 'relative'
    }}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          backgroundColor: COLORS.cardBackground,
          color: COLORS.textPrimary,
          borderLeft: `4px solid ${COLORS.primary}`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
        progressStyle={{
          background: COLORS.primary
        }}
      />

      <Box sx={{ p: 3 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          color={COLORS.primary}
          sx={{ mb: 2 }}
        >
          Swipe Restaurants
        </Typography>

        <Box sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 400,
          height: 500,
          mx: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {loading ? (
            <CircularProgress sx={{ color: COLORS.primary }} />
          ) : db.length === 0 && currentIndex < 0 ? (
            <Paper elevation={3} sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: COLORS.cardBackground
            }}>
              <Typography variant="h6" color={COLORS.textPrimary}>
                No more restaurants to swipe!
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(-1)}
                sx={{
                  mt: 2,
                  bgcolor: COLORS.primary,
                  '&:hover': { bgcolor: COLORS.primary }
                }}
              >
                Back to Groups
              </Button>
            </Paper>
          ) : (
            db.map((restaurant, index) => (
              <TinderCard
                ref={childRefs.current[index]} // Use .current for refs array
                key={restaurant.id}
                onSwipe={handleCardSwipedByUser} // Call the refined handler
                onCardLeftScreen={() => outOfFrame(restaurant.id)}
                preventSwipe={['up', 'down']}
                swipeThreshold={50}
                flickOnSwipe={true}
                className="swipe"
              >
                <Card
                  onClick={() => handleCardClick(restaurant)}
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: 3,
                    bgcolor: COLORS.cardBackground,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {restaurant.photo ? (
                    <CardMedia
                      component="img"
                      height="300"
                      image={restaurant.photo}
                      alt={restaurant.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box sx={{
                      height: 300,
                      bgcolor: COLORS.secondary,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <RestaurantIcon sx={{ fontSize: 80, color: COLORS.primary }} />
                    </Box>
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight={700}>
                        {restaurant.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Star sx={{ color: '#FFD700', mr: 0.5 }} />
                        <Typography>{restaurant.rating || 'N/A'}</Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" color={COLORS.textPrimary} sx={{ mt: 1 }}>
                      {restaurant.address}
                    </Typography>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      {restaurant.types?.slice(0, 3).map((type, i) => (
                        <Chip
                          key={i}
                          label={type.replace(/_/g, ' ')}
                          size="small"
                          sx={{
                            bgcolor: COLORS.accent,
                            color: COLORS.textPrimary
                          }}
                        />
                      ))}
                      {restaurant.priceLevel && (
                        <Chip
                          label={getPriceLevel(restaurant.priceLevel)}
                          size="small"
                          sx={{
                            bgcolor: COLORS.primary,
                            color: 'white'
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </TinderCard>
            ))
          )}
        </Box>

        {db.length > 0 && currentIndex >= 0 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            mt: 4,
            mb: 2
          }}>
            <IconButton
              size="large"
              sx={{
                bgcolor: COLORS.secondary,
                color: COLORS.textPrimary,
                '&:hover': { bgcolor: COLORS.secondary }
              }}
              onClick={() => handleSwipeButton('left')}
            >
              <Close fontSize="large" />
            </IconButton>
            <IconButton
              size="large"
              sx={{
                bgcolor: COLORS.primary,
                color: 'white',
                '&:hover': { bgcolor: COLORS.primary }
              }}
              onClick={() => handleSwipeButton('right')}
            >
              <Favorite fontSize="large" />
            </IconButton>
          </Box>
        )}

        {lastDirection && (
          <Typography
            variant="h6"
            color={lastDirection === 'right' ? COLORS.primary : COLORS.textPrimary}
            textAlign="center"
            sx={{ mt: 2 }}
          >
            You swiped {lastDirection === 'right' ? 'right 👍' : 'left 👎'}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default RestaurantSwipe;