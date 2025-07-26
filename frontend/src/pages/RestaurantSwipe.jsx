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
  const childRefs = useMemo(() => 
    Array(mockRestaurants.length).fill(0).map(() => React.createRef()),
    [mockRestaurants.length]
  );

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
        const filteredRestaurants = mockRestaurants.filter(
          restaurant => !swipedRestaurants.has(restaurant.id)
        );
        
        if (filteredRestaurants.length > 0) {
          setDb(filteredRestaurants);
          setCurrentIndex(filteredRestaurants.length - 1);
        } else {
          setDb([]);
          setCurrentIndex(-1);
        }
        setLoading(false);
      }, 500);
    };

    loadMockRestaurants();
  }, [groupId, token, swipedRestaurants]);

  const outOfFrame = useCallback((id) => {
    console.log(`${id} left the screen!`);
    setSwipedRestaurants(prev => new Set(prev).add(id));
    setDb(prevDb => prevDb.filter(restaurant => restaurant.id !== id));
  }, []);

  const swipe = useCallback(async (dir) => {
    const targetIndex = currentIndexRef.current;
    
    if (targetIndex < 0 || !childRefs[targetIndex]?.current) {
      console.log('No more cards to swipe');
      return;
    }

    const restaurantToSwipe = db[targetIndex];
    if (!restaurantToSwipe) return;

    try {
      // Programmatically trigger swipe animation
      await childRefs[targetIndex].current.swipe(dir);
      setLastDirection(dir);

      // Save swipe to backend
     // In your frontend swipe function
const response = await axios.post(
  'http://localhost:5000/api/swipes/save',
  {
    groupId,
    restaurantId: restaurantToSwipe.id,
    direction: dir === 'right' ? 'right' : 'left'
  },
  { headers: { Authorization: `Bearer ${token}` } }
);

if (response.status === 201) {
  // Successful new swipe
  setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
  setCurrentIndex(prevIndex => prevIndex - 1);
} else if (response.status === 409) {
  // Already swiped - just move to next card
  setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
  setCurrentIndex(prevIndex => prevIndex - 1);
}
    } catch (err) {
      console.error('Swipe error:', err);
      toast.error(`Failed to save swipe. ${err.response?.data?.error || ''}`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true
      });
    } finally {
      // Update swiped restaurants and move to next card
      setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
      setCurrentIndex(prevIndex => Math.max(prevIndex - 1, -1));
    }
  }, [groupId, db, token, childRefs]);

  const handleSwipeButton = (dir) => {
    swipe(dir);
  };

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
          {db.length === 0 && currentIndex < 0 ? (
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
                ref={childRefs[index]}
                key={restaurant.id}
                onSwipe={(dir) => {
                  swipe(dir);
                }}
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