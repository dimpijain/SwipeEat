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
// NEW: Import the Google API service
import { getCoordinates, getNearbyRestaurants } from '../services/googleApiService';

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
  const [token, setToken] = useState('');
  const [swipedRestaurants, setSwipedRestaurants] = useState(new Set());

  const currentIndexRef = useRef(currentIndex);
  const childRefs = useRef([]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (childRefs.current.length !== db.length) {
      childRefs.current = Array(db.length).fill(0).map((_, i) => childRefs.current[i] || React.createRef());
    }
  }, [db]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login');
      return;
    }
    setToken(storedToken);
  }, [navigate]);

  // --- MODIFIED: Load restaurants from Google Places API ---
  useEffect(() => {
    if (!token || !groupId) return;

    const loadRestaurants = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch group details to get location and radius
        const groupRes = await axios.get(`http://localhost:5000/api/group/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const { location, radius } = groupRes.data.group;

        if (!location || !radius) {
            throw new Error("Group location or search radius is not set.");
        }
        
        // 2. Get coordinates for the group's location
        const { lat, lng } = await getCoordinates(location);

        // 3. Fetch nearby restaurants from Google
        const googleRestaurants = await getNearbyRestaurants(lat, lng, radius);
        
        // Filter out any restaurants that have already been swiped by the user in this session
        const alreadySwipedInDb = await axios.get(`http://localhost:5000/api/swipes/user/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const swipedIds = new Set(alreadySwipedInDb.data.swipes.map(s => s.restaurantId));

        const filteredRestaurants = googleRestaurants.filter(
            restaurant => !swipedIds.has(restaurant.id) && !swipedRestaurants.has(restaurant.id)
        );

        const reversedRestaurants = [...filteredRestaurants].reverse();

        setDb(reversedRestaurants);
        setCurrentIndex(reversedRestaurants.length - 1);
      } catch (err) {
        console.error("Failed to load restaurants:", err);
        setError(err.message || 'An error occurred while fetching dining spots.');
        setDb([]);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, [groupId, token]); // Now depends on token and groupId

  const outOfFrame = useCallback((id) => {
    console.log(`${id} left the screen!`);
  }, []);

  const swipe = useCallback(async (dir) => {
    const targetIndex = currentIndexRef.current;

    if (targetIndex < 0 || !db[targetIndex]) {
      console.log('No more cards to swipe or invalid target index.');
      setLastDirection(dir);
      return;
    }

    const restaurantToSwipe = db[targetIndex];
    const cardRef = childRefs.current[targetIndex];

    if (!cardRef || !cardRef.current) {
      console.warn(`Ref for index ${targetIndex} is null or undefined.`);
      setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
      setCurrentIndex(prevIndex => prevIndex - 1);
      return;
    }

    try {
      await cardRef.current.swipe(dir);
      setLastDirection(dir);

      await axios.post(
        'http://localhost:5000/api/swipes/save',
        {
          groupId,
          restaurantId: restaurantToSwipe.id, // Now using Google Place ID
          direction: dir
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
      setCurrentIndex(prevIndex => prevIndex - 1);

      if (dir === 'right') {
          toast.success(`Liked ${restaurantToSwipe.name}!`);
      }
    } catch (err) {
      console.error('Swipe error:', err);
      setError(err.response?.data?.message || err.message || 'An unknown error occurred during swipe.');
      // Still move to the next card to prevent getting stuck
      setSwipedRestaurants(prev => new Set(prev).add(restaurantToSwipe.id));
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  }, [groupId, db, token]);

  const handleSwipeButton = (dir) => {
    swipe(dir);
  };

  const handleCardSwipedByUser = useCallback((dir, id) => {
    setLastDirection(dir);
  }, []);

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

  const renderCards = useMemo(() => {
    if (loading) {
      return <CircularProgress sx={{ color: COLORS.primary }} />;
    }

    if (error) {
        return (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', bgcolor: COLORS.cardBackground }}>
                <Alert severity="error">{error}</Alert>
                <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2, bgcolor: COLORS.primary }}>
                    Back to Groups
                </Button>
            </Paper>
        );
    }

    if (db.length === 0 || currentIndex < 0) {
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

    return db.map((restaurant, index) => (
      index <= currentIndex ? (
        <TinderCard
          ref={childRefs.current[index]}
          key={restaurant.id}
          onSwipe={(dir) => handleCardSwipedByUser(dir, restaurant.id)}
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
  }, [db, loading, error, currentIndex, handleCardSwipedByUser, outOfFrame, navigate]);


  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: COLORS.background,
      position: 'relative'
    }}>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar
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
          {renderCards}
        </Box>

        {db.length > 0 && currentIndex >= 0 && !loading && !error && (
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
              disabled={currentIndex < 0}
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
              disabled={currentIndex < 0}
            >
              <Favorite fontSize="large" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Details Modal - No change needed here */}
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
            {/* The following fields are not available from Nearby Search, would need Place Details API */}
            {/* For now, they will just not render if data is absent */}
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