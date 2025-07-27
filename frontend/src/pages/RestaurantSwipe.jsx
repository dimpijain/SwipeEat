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
import { jwtDecode } from 'jwt-decode'; // Keep if you use it elsewhere, though not directly in this snippet
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
  const [error, setError] = useState(null); // Keep error state for potential API errors
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [token, setToken] = useState('');
  const [swipedRestaurants, setSwipedRestaurants] = useState(new Set()); // Tracks IDs of all swiped restaurants

  // Use a ref to keep track of the current index without re-rendering issues
  const currentIndexRef = useRef(currentIndex);
  const childRefs = useRef([]); // This will hold refs for each TinderCard

  // Effect to update currentIndexRef when currentIndex changes
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Effect to initialize/re-initialize childRefs when db changes
  useEffect(() => {
    // Only re-initialize if the length of db has changed, or on initial load
    if (childRefs.current.length !== db.length) {
      childRefs.current = Array(db.length).fill(0).map((_, i) => childRefs.current[i] || React.createRef());
    }
  }, [db]);

  // Authenticate user with token
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login');
      return;
    }
    setToken(storedToken);
  }, [navigate]);

  // Load restaurants based on groupId and swipedRestaurants
  useEffect(() => {
    if (!token || !groupId) return;

    const loadRestaurants = () => {
      setLoading(true);
      setError(null); // Clear previous errors

      // Simulate API call delay for mock data
      setTimeout(() => {
        // Filter out restaurants that have already been swiped in the current session
        const filteredRestaurants = mockRestaurants.filter(
          restaurant => !swipedRestaurants.has(restaurant.id)
        );
        // Reverse the array so the last element is on top (Tinder-like stack)
        const reversedRestaurants = [...filteredRestaurants].reverse();

        setDb(reversedRestaurants);
        // Set currentIndex to the last element of the reversed array
        setCurrentIndex(reversedRestaurants.length - 1);
        setLoading(false);
      }, 500);
    };

    loadRestaurants();
  }, [groupId, token, swipedRestaurants]); // Re-run when swipedRestaurants changes

  // Callback for when a card leaves the screen (TinderCard's internal mechanism)
  // This is called AFTER the animation completes.
  const outOfFrame = useCallback((id) => {
    console.log(`${id} left the screen!`);
    // The `swipe` function below already handles adding to `swipedRestaurants`
    // and decrementing `currentIndex`. This is primarily for logging/debugging TinderCard's lifecycle.
  }, []);

  // Main swipe logic for both button clicks and user gestures
  const swipe = useCallback(async (dir) => {
    const targetIndex = currentIndexRef.current; // Get the most current index from ref

    // Check if there are cards left to swipe
    if (targetIndex < 0 || !db[targetIndex]) {
      console.log('No more cards to swipe or invalid target index.');
      setLastDirection(dir); // Still update direction if it was a button press on empty stack
      return;
    }

    const restaurantToSwipe = db[targetIndex];
    const cardRef = childRefs.current[targetIndex];

    // Crucial check: Ensure the ref exists and is attached to a DOM node
    if (!cardRef || !cardRef.current) {
      console.warn(`Ref for index ${targetIndex} is null or undefined. Cannot programmatically swipe.`);
      // If ref is not ready, we can still proceed to decrement the index
      // and update swiped status, but the animation won't happen.
      // This helps prevent being stuck on a card that can't be swiped visually.
      setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
      setCurrentIndex(prevIndex => prevIndex - 1); // Immediately move to the next card
      toast.info('Card not ready for animation, but swipe processed.', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true
      });
      return;
    }

    try {
      // Programmatically swipe the card to trigger the animation
      await cardRef.current.swipe(dir); // This triggers the animation and subsequently onCardLeftScreen

      // Set last direction immediately for UI feedback
      setLastDirection(dir);

      // Make API call to save swipe
      const response = await axios.post(
        'http://localhost:5000/api/swipes/save',
        {
          groupId,
          restaurantId: restaurantToSwipe.id,
          direction: dir // 'left' or 'right'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check for success (201 Created or 200 OK for existing swipe/left swipe)
      if (response.status === 201 || response.status === 200) {
        // Add to swipedRestaurants set to ensure it doesn't reappear in this session
        setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
        // Decrement current index to show the next card
        setCurrentIndex(prevIndex => prevIndex - 1);

        if (dir === 'right') {
          toast.success(`Liked ${restaurantToSwipe.name}!`, {
              position: "top-center",
              autoClose: 1000,
              hideProgressBar: true
          });
        } else {
          toast.info(`Skipped ${restaurantToSwipe.name}!`, {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: true
          });
        }
        console.log(`Successfully processed swipe for ${restaurantToSwipe.name}`);
      } else {
        // This block catches unexpected successful statuses (e.g., 204 No Content if your API changes)
        toast.error(`Unexpected response status: ${response.status}. Failed to save swipe.`, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true
        });
      }
    } catch (err) {
      console.error('Swipe error:', err);
      setError(err.response?.data?.message || err.message || 'An unknown error occurred during swipe.');

      if (err.response) {
        // Handle specific API error responses
        if (err.response.status === 409) { // Conflict: already swiped
          console.log(`Restaurant ${restaurantToSwipe.name} already swiped.`);
          setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
          setCurrentIndex(prevIndex => prevIndex - 1); // Still move to the next card
          toast.info(`Already swiped ${restaurantToSwipe.name}.`, {
            position: "top-center",
            autoClose: 1500,
            hideProgressBar: true
          });
        } else if (err.response.status === 400 || err.response.status === 403 || err.response.status === 404) {
          // Bad Request, Forbidden, Not Found
          toast.error(`Error: ${err.response.data.message}`, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true
          });
          // For these errors, you might or might not want to decrement the index,
          // depending on whether the swipe was genuinely invalid.
          // For now, let's decrement to move on from the problematic card.
          setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
          setCurrentIndex(prevIndex => prevIndex - 1);
        } else {
          // General 500 or other unhandled errors
          toast.error(`Server error: ${err.response.data.message || 'Please try again.'}`, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true
          });
          // Decrement index to allow user to continue if it's a transient server issue
          setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
          setCurrentIndex(prevIndex => prevIndex - 1);
        }
      } else {
        // Network error or other client-side error before response
        toast.error(`Network error: ${err.message}`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true
        });
        // Decrement index to allow user to continue
        setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
        setCurrentIndex(prevIndex => prevIndex - 1);
      }
    }
  }, [groupId, db, token, swipedRestaurants]); // Added swipedRestaurants to dependencies for `setSwipedRestaurants` update within `swipe`

  // Handler for manual button swipes
  const handleSwipeButton = (dir) => {
    swipe(dir); // Call the main swipe logic
  };

  // Handler for TinderCard's onSwipe event (user gestures)
  const handleCardSwipedByUser = useCallback((dir, id) => {
    // When a user physically swipes, this is called.
    // The `swipe` function already handles the API call and state updates
    // (including `currentIndex` and `swipedRestaurants`).
    // So, we just need to set the `lastDirection` for immediate UI feedback.
    setLastDirection(dir);
    // The `swipe` function will be called internally by TinderCard's animation
    // completing, or if a button was pressed, it calls `swipe` directly.
    // No need to call `swipe(dir)` again here if TinderCard itself triggers the visual swipe.
    // This function is mainly here to capture user-initiated swipe direction for `lastDirection`.
  }, []); // No dependencies needed for this simple setter

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

  // Memoize the cards to prevent unnecessary re-renders of TinderCard components
  const renderCards = useMemo(() => {
    if (loading) {
      return <CircularProgress sx={{ color: COLORS.primary }} />;
    }

    if (db.length === 0 && currentIndex < 0) {
      return (
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
      );
    }

    // Render cards from the current index down to 0 for the stack effect
    // This only renders the active cards that the user can interact with.
    return db.map((restaurant, index) => (
      index <= currentIndex ? ( // Only render cards at or below the current index
        <TinderCard
          ref={childRefs.current[index]} // Assign the ref based on the original index in the `db` array
          key={restaurant.id}
          onSwipe={(dir) => handleCardSwipedByUser(dir, restaurant.id)}
          onCardLeftScreen={() => outOfFrame(restaurant.id)}
          preventSwipe={['up', 'down']}
          swipeThreshold={50}
          flickOnSwipe={true}
          className="swipe" // Ensure this class is styled correctly for positioning
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

              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
      ) : null
    ));
  }, [db, loading, currentIndex, handleCardSwipedByUser, outOfFrame, navigate]);


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
          Discover Dining Spots
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
          {renderCards} {/* Render memoized cards */}
        </Box>

        {db.length > 0 && currentIndex >= 0 && !loading && (
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
              disabled={currentIndex < 0} // Disable if no more cards
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
              disabled={currentIndex < 0} // Disable if no more cards
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

      {/* Restaurant Details Modal/Sidebar */}
      {showDetails && currentRestaurant && (
        <Paper
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: COLORS.background,
            zIndex: 1000,
            overflowY: 'auto',
            p: 3,
            boxSizing: 'border-box'
          }}
        >
          <IconButton
            onClick={handleBackToSwipe}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: COLORS.secondary,
              color: COLORS.textPrimary,
              '&:hover': { bgcolor: COLORS.secondary }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ mt: 5 }}>
            <Typography variant="h4" fontWeight={700} color={COLORS.primary} mb={2}>
              {currentRestaurant.name}
            </Typography>
            {currentRestaurant.photo ? (
              <Box
                component="img"
                src={currentRestaurant.photo}
                alt={currentRestaurant.name}
                sx={{
                  width: '100%',
                  height: 250,
                  objectFit: 'cover',
                  borderRadius: 2,
                  mb: 2
                }}
              />
            ) : (
                <Box sx={{
                    height: 250,
                    bgcolor: COLORS.secondary,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 2,
                    mb: 2
                }}>
                    <RestaurantIcon sx={{ fontSize: 100, color: COLORS.primary }} />
                </Box>
            )}
            <Typography variant="body1" color={COLORS.textPrimary} mb={1}>
              <LocationOn sx={{ verticalAlign: 'middle', mr: 1 }} />
              {currentRestaurant.address}
            </Typography>
            <Typography variant="body1" color={COLORS.textPrimary} mb={1}>
              <Star sx={{ verticalAlign: 'middle', mr: 1, color: '#FFD700' }} />
              Rating: {currentRestaurant.rating || 'N/A'} ({currentRestaurant.user_ratings_total || 0} reviews)
            </Typography>
            {currentRestaurant.priceLevel && (
              <Typography variant="body1" color={COLORS.textPrimary} mb={1}>
                <Typography component="span" fontWeight="bold">Price Level:</Typography> {getPriceLevel(currentRestaurant.priceLevel)}
              </Typography>
            )}
            {currentRestaurant.phoneNumber && (
              <Typography variant="body1" color={COLORS.textPrimary} mb={1}>
                <Phone sx={{ verticalAlign: 'middle', mr: 1 }} />
                Phone: <a href={`tel:${currentRestaurant.phoneNumber}`} style={{ color: COLORS.primary, textDecoration: 'none' }}>{currentRestaurant.phoneNumber}</a>
              </Typography>
            )}
            {currentRestaurant.website && (
              <Typography variant="body1" color={COLORS.textPrimary} mb={1}>
                <Language sx={{ verticalAlign: 'middle', mr: 1 }} />
                Website: <a href={currentRestaurant.website} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.primary, textDecoration: 'none' }}>Visit Website</a>
              </Typography>
            )}
            {currentRestaurant.openingHours && currentRestaurant.openingHours.length > 0 && (
              <Box mt={2}>
                <Typography variant="h6" color={COLORS.textPrimary} mb={1}>
                  <Schedule sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Opening Hours:
                </Typography>
                {currentRestaurant.openingHours.map((hour, index) => (
                  <Typography key={index} variant="body2" color={COLORS.textPrimary}>
                    {hour}
                  </Typography>
                ))}
              </Box>
            )}
            <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {currentRestaurant.types?.map((type, i) => (
                <Chip
                  key={i}
                  label={type.replace(/_/g, ' ')}
                  size="medium"
                  sx={{
                    bgcolor: COLORS.accent,
                    color: COLORS.textPrimary,
                    fontWeight: 'bold'
                  }}
                />
              ))}
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default RestaurantSwipe;