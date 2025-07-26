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
import mockRestaurants from '../mockRestaurants'; // Ensure this path is correct

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
  const [showDetails, setShowDetails] = useState(false); // Not actively used in provided code for restaurant details view
  const [currentRestaurant, setCurrentRestaurant] = useState(null); // Not actively used
  const [restaurantDetails, setRestaurantDetails] = useState(null); // Not actively used
  const [token, setToken] = useState('');
  const [swipedRestaurants, setSwipedRestaurants] = useState(new Set());

  const currentIndexRef = useRef(currentIndex);
  const childRefs = useRef([]);

  // UseEffect to update childRefs when db changes
  useEffect(() => {
    childRefs.current = Array(db.length).fill(0).map((_, i) => childRefs.current[i] || React.createRef());
  }, [db]);

  // UseEffect to keep currentIndexRef updated
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Handle token fetching and redirection
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login');
      return;
    }
    setToken(storedToken);
  }, [navigate]);

  // Load restaurants based on group and already swiped ones
  useEffect(() => {
    if (!token || !groupId) return;

    const loadRestaurants = () => { // Renamed from loadMockRestaurants for clarity
      setLoading(true);
      setError(null);
      // Simulate API call delay
      setTimeout(() => {
        // Filter out already swiped restaurants from mock data
        const filteredRestaurants = mockRestaurants.filter(
          restaurant => !swipedRestaurants.has(restaurant.id)
        );

        // TinderCard expects the array to be in reverse order for correct stacking (top card is last element)
        const reversedRestaurants = [...filteredRestaurants].reverse();

        if (reversedRestaurants.length > 0) {
          setDb(reversedRestaurants);
          setCurrentIndex(reversedRestaurants.length - 1); // Index of the top card
        } else {
          setDb([]);
          setCurrentIndex(-1); // No more cards
        }
        setLoading(false);
      }, 500);
    };

    loadRestaurants();
  }, [groupId, token, swipedRestaurants]); // Re-run when groupId, token, or swipedRestaurants change

  // Callback when a card leaves the screen (after animation)
  const outOfFrame = useCallback((id) => {
    console.log(`${id} left the screen!`);
    // This function is for post-animation cleanup.
    // The actual state update for swiped restaurants (adding to set, decrementing index)
    // is handled in the 'swipe' function after a successful API call.
  }, []);

  // Main swipe logic: handles both button clicks and user's physical swipes
  const swipe = useCallback(async (dir, isUserInitiatedSwipe = false) => {
    const targetIndex = currentIndexRef.current;

    // Guard against invalid index or no cards left
    if (targetIndex < 0 || !db[targetIndex] || !childRefs.current[targetIndex]?.current) {
      console.log('No more cards to swipe or invalid target index.');
      return;
    }

    const restaurantToSwipe = db[targetIndex];

    try {
      // Programmatically trigger swipe animation only if it's not a user's physical swipe
      if (!isUserInitiatedSwipe) {
        await childRefs.current[targetIndex].current.swipe(dir);
      }
      setLastDirection(dir); // Update last direction immediately for UI feedback

      // Make API call to save the swipe
      const response = await axios.post(
        'http://localhost:5000/api/swipes/save',
        {
          groupId,
          restaurantId: restaurantToSwipe.id,
          direction: dir === 'right' ? 'right' : 'left'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Handle successful swipe (201 created or 409 conflict)
      if (response.status === 201 || response.status === 409) {
        setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
        setCurrentIndex(prevIndex => prevIndex - 1);
        console.log(`Successfully processed swipe for ${restaurantToSwipe.name}`);

        // Check if a match occurred (backend sends isMatch: true)
        if (response.data.isMatch) {
          toast.success(`🎉 It's a Match! You and your group matched on ${restaurantToSwipe.name}!`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored", // Use a distinct theme for success
            style: { backgroundColor: COLORS.primary, color: 'white' }
          });
        }
      } else {
        // Fallback for unexpected successful status codes (should ideally be caught by catch)
        toast.error(`Unexpected response status: ${response.status}. Failed to save swipe.`, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true
        });
      }
    } catch (err) {
      console.error('Swipe error:', err);
      // Specifically handle 409 (already swiped) without an error toast
      if (err.response && err.response.status === 409) {
          console.log(`Restaurant ${restaurantToSwipe.name} already swiped.`);
          // Still update state to remove card from UI as it's effectively processed
          setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
          setCurrentIndex(prevIndex => prevIndex - 1);
      } else {
          // Show error toast for other types of failures
          toast.error(`Failed to save swipe. ${err.response?.data?.error || err.message || ''}`, {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: true
          });
          // If the swipe failed (and not 409), the card remains on screen for re-attempt or user action.
          // If you want it to move off anyway on any error, move setSwipedRestaurants and setCurrentIndex here too.
          // For now, it stays to indicate failure to the user.
      }
    }
  }, [groupId, db, token]);

  // Handler for swipe buttons
  const handleSwipeButton = (dir) => {
    swipe(dir, false); // Not user-initiated from card, so programmatically swipe
  };

  // Handler for user's physical card swipe
  const handleCardSwipedByUser = useCallback((dir) => {
    swipe(dir, true); // It is a user-initiated swipe from the card
  }, [swipe]);

  // Handlers for showing restaurant details (currently not fully implemented in UI but functions exist)
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

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.background, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: COLORS.background, minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => window.location.reload()} sx={{ mt: 2, bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primary } }}>
          Retry Loading
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: COLORS.background,
      position: 'relative',
      display: 'flex', // Use flexbox for layout
      flexDirection: 'column', // Arrange content vertically
      alignItems: 'center', // Center content horizontally
      p: 3, // Padding around the main content
    }}>
      <ToastContainer
        position="top-center"
        autoClose={3000} // Default autoClose for general toasts
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

      <Typography
        variant="h4"
        fontWeight={700}
        color={COLORS.primary}
        sx={{ mb: 4 }} // Increased bottom margin
      >
        Swipe Restaurants
      </Typography>

      <Box sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 400, // Max width for the card stack
        height: 500,    // Fixed height for the card stack area
        mx: 'auto',     // Center horizontally
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mb: 4, // Margin below card stack
      }}>
        {db.length === 0 && currentIndex < 0 ? (
          <Paper elevation={3} sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: COLORS.cardBackground,
            borderRadius: 3,
            width: '100%', height: '100%', // Fill the parent Box
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
          }}>
            <Typography variant="h6" color={COLORS.textPrimary} mb={2}>
              No more restaurants to swipe!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(`/dashboard`)} // Redirect to dashboard
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
            // Only render cards that are still 'active' or on top of the stack
            // This can prevent issues with TinderCard if many cards are outOfFrame
            <TinderCard
              ref={childRefs.current[index]}
              key={restaurant.id}
              onSwipe={handleCardSwipedByUser}
              onCardLeftScreen={() => outOfFrame(restaurant.id)}
              preventSwipe={['up', 'down']}
              swipeThreshold={50}
              flickOnSwipe={true}
              className="swipe" // Apply custom CSS for position if needed
              sx={{ // Inline styles for TinderCard can be tricky, often better in CSS
                 position: 'absolute', // Ensures cards stack on top of each other
                 width: '100%',
                 height: '100%',
                 display: 'flex',
                 justifyContent: 'center',
                 alignItems: 'center',
              }}
            >
              <Card
                onClick={() => handleCardClick(restaurant)}
                sx={{
                  width: '100%', // Card fills TinderCard wrapper
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

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary}>
                      {restaurant.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ color: '#FFD700', mr: 0.5 }} />
                      <Typography variant="body1" color={COLORS.textPrimary}>{restaurant.rating || 'N/A'}</Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color={COLORS.textPrimary} sx={{ mb: 1 }}>
                    {restaurant.address}
                  </Typography>

                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
              '&:hover': { bgcolor: COLORS.secondary },
              boxShadow: 3, // Add shadow for better appearance
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
              '&:hover': { bgcolor: COLORS.primary },
              boxShadow: 3, // Add shadow
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
  );
};

export default RestaurantSwipe;