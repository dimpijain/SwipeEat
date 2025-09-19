import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import api from '../api'; 
import socket from '../socket'; 
import { Box, Card, CardMedia, CardContent, Typography, IconButton, Chip, Button, Paper, CircularProgress, Alert, AppBar, Toolbar, Badge, Fab, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Stack } from '@mui/material';
import { Close, Favorite, ArrowBack, Star, CheckCircleOutline, Fastfood, ThumbUp, Chat as ChatIcon, LocationOn, Phone, Public, AccessTime } from '@mui/icons-material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import { getNearbyRestaurants, getRestaurantDetails } from '../services/googleApiService';
import ChatDrawer from '../components/ChatDrawer';

const COLORS = {
  primary: '#FF7F7F',
  secondary: '#FFD6B0',
  // ✅ CHANGED: New lighter background color
  background: '#FFF4F4', 
  textPrimary: '#575761',
  cardBackground: '#FFFFFF',
  accent: '#B5EAD7'
};

const RestaurantSwipe = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votes, setVotes] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRestaurantDetails, setSelectedRestaurantDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const childRefs = useRef([]);

  useEffect(() => {
    if (restaurants.length > 0) {
      childRefs.current = Array(restaurants.length).fill(0).map((_, i) => childRefs.current[i] || React.createRef());
    }
  }, [restaurants.length]);

  useEffect(() => {
    socket.connect();
    socket.emit('joinGroup', groupId);

    const handleMatchFound = ({ restaurantId }) => {
      toast.success("It's a match! Redirecting...");
      navigate(`/group/${groupId}/match/${restaurantId}`);
    };
    const handleVoteUpdate = (newVotes) => setVotes(newVotes);

    socket.on('matchFound', handleMatchFound);
    socket.on('voteUpdate', handleVoteUpdate);

    return () => {
      socket.off('matchFound', handleMatchFound);
      socket.off('voteUpdate', handleVoteUpdate);
      socket.disconnect();
    };
  }, [groupId, navigate]);
  
  useEffect(() => {
    const loadRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
        const groupRes = await api.get(`/api/group/${groupId}`);
        const { location, radius } = groupRes.data.group;
        if (!location || !radius) throw new Error("Group details are incomplete.");
        
        const googleRestaurants = await getNearbyRestaurants(location, radius); 
        const alreadySwipedRes = await api.get(`/api/swipes/user/${groupId}`);
        const swipedIds = new Set(alreadySwipedRes.data.swipes.map(s => s.restaurantId));

        const filteredRestaurants = googleRestaurants.filter(r => !swipedIds.has(r.id));
        const reversedRestaurants = [...filteredRestaurants].reverse();

        setRestaurants(reversedRestaurants);
        setCurrentIndex(reversedRestaurants.length - 1);
      } catch (err) {
        setError(err.message || 'Could not fetch restaurants.');
      } finally {
        setLoading(false);
      }
    };
    loadRestaurants();
  }, [groupId]);

  const handleSwipe = (direction, restaurantId) => {
    api.post('/api/swipes/save', { groupId, restaurantId, direction });
    if (direction === 'right') {
      socket.emit('userSwipedRight', { groupId, restaurantId });
    }
    setCurrentIndex(prevIndex => prevIndex - 1);
  };
  
  const handleSwipeButton = async (dir) => {
    if (currentIndex < 0 || !restaurants[currentIndex]) return;
    await childRefs.current[currentIndex]?.current?.swipe(dir);
  };
  
  const getPriceLevel = (level) => level ? '$'.repeat(level) : '';

  const handleCardClick = async (restaurantId) => {
    setDetailsLoading(true);
    setDetailsModalOpen(true);
    try {
      const details = await getRestaurantDetails(restaurantId);
      setSelectedRestaurantDetails(details);
    } catch (err) {
      toast.error('Failed to load restaurant details.');
      console.error("Failed to fetch restaurant details:", err);
      setSelectedRestaurantDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const renderContent = useMemo(() => {
    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (currentIndex < 0) {
      return (
        <Paper elevation={4} sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
            <CheckCircleOutline sx={{ fontSize: 60, color: COLORS.accent }} />
            <Typography variant="h5" fontWeight={700}>All Done!</Typography>
            <Typography color="text.secondary">You've swiped through all available restaurants.</Typography>
        </Paper>
      );
    }
    
    return restaurants.map((restaurant, index) => (
      index <= currentIndex && (
        <TinderCard 
          ref={childRefs.current[index]} 
          key={restaurant.id} 
          onSwipe={(dir) => handleSwipe(dir, restaurant.id)} 
          preventSwipe={['up', 'down']} 
          className="swipe"
        >
          <Card 
            sx={{ width: '100%', height: '100%', borderRadius: 4, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)', cursor: 'pointer' }} 
            onClick={() => handleCardClick(restaurant.id)}
          >
            <Box sx={{ height: '70%', position: 'relative' }}>
              {restaurant.photo ? <CardMedia component="img" image={restaurant.photo} alt={restaurant.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Box sx={{ height: '100%', bgcolor: COLORS.secondary, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><RestaurantIcon sx={{ fontSize: 80, color: 'rgba(0,0,0,0.2)' }} /></Box>}
              <Badge badgeContent={<><ThumbUp sx={{ fontSize: '1rem', mr: 0.5 }} />{votes[restaurant.id] || 0}</>} color="primary" sx={{ position: 'absolute', top: 16, right: 16 }} />
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', p: 2, color: 'white' }}>
                <Typography variant="h5" fontWeight={700}>{restaurant.name}</Typography>
              </Box>
            </Box>
            <CardContent sx={{ height: '30%', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="body2" color={COLORS.textPrimary} noWrap>{restaurant.address}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                      {restaurant.types?.slice(0, 1).map((type) => (<Chip key={type} label={type.replace(/_/g, ' ')} size="small" sx={{ bgcolor: COLORS.accent }} />))}
                      {restaurant.priceLevel && (<Chip label={getPriceLevel(restaurant.priceLevel)} size="small" sx={{ bgcolor: COLORS.secondary }} />)}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ color: '#FFD700' }} /><Typography fontWeight="bold">{restaurant.rating || 'N/A'}</Typography>
                  </Box>
              </Box>
            </CardContent>
          </Card>
        </TinderCard>
      )
    ));
  }, [restaurants, currentIndex, loading, error, votes, navigate, handleCardClick]);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${COLORS.background} 0%, #FFE5E5 100%)`, 
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url('https://www.heropatterns.com/uploads/pattern/227/food-transparent-1583182801.svg')`,
        backgroundRepeat: 'repeat', backgroundSize: '300px', opacity: 0.08, zIndex: 0
      },
      '@keyframes bounce': {
        '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
        '40%': { transform: 'translateY(-10px)' },
        '60%': { transform: 'translateY(-5px)' },
      },
    }}>
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
      <AppBar position="static" sx={{ bgcolor: 'transparent', boxShadow: 'none', zIndex: 1 }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ color: COLORS.textPrimary }}><ArrowBack /></IconButton>
          <Fastfood sx={{ color: COLORS.primary, ml: 1, mr: 1 }} />
          <Typography variant="h5" fontWeight={800} color={COLORS.primary} sx={{ fontFamily: "'Pacifico', cursive" }}>SwipeEat</Typography>
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, gap: 3, zIndex: 1 }}>
        <Typography variant="h4" fontWeight={700} color={COLORS.textPrimary} textAlign="center">Discover Dining Spots</Typography>
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 350, height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {renderContent}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, alignItems: 'center', height: 80, mt: 2 }}>
          <IconButton onClick={() => handleSwipeButton('left')} sx={{ bgcolor: 'white', color: COLORS.textPrimary, boxShadow: 3, width: 64, height: 64, '&:hover': { transform: 'scale(1.1)' } }}><Close sx={{ fontSize: 32 }} /></IconButton>
          <IconButton onClick={() => handleSwipeButton('right')} sx={{ bgcolor: COLORS.primary, color: 'white', boxShadow: 3, width: 80, height: 80, '&:hover': { transform: 'scale(1.1)' } }}><Favorite sx={{ fontSize: 40 }}/></IconButton>
        </Box>
      </Box>

       <Box sx={{ position: 'absolute', bottom: 24, right: 24, zIndex: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography 
          sx={{ 
            fontFamily: "'Pacifico', cursive",
            color: COLORS.primary, 
            fontWeight: 600,
            animation: 'bounce 2s ease-in-out infinite' 
          }}
        >
          Group Chat!
        </Typography>
        <Fab 
          onClick={() => setIsChatOpen(true)}
          // ✅ CHANGED: Larger size and updated color scheme
          sx={{ 
            bgcolor: COLORS.primary, 
            color: 'white',
            width: 64,
            height: 64,
            '&:hover': {
              bgcolor: '#E56D62'
            }
          }}
        >
          <ChatIcon sx={{ fontSize: '2rem' }} />
        </Fab>
      </Box>

      <ChatDrawer 
        groupId={groupId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
      
      <Dialog open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedRestaurantDetails?.name || 'Restaurant Details'}
          <IconButton onClick={() => setDetailsModalOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedRestaurantDetails ? (
            <Stack spacing={2}>
              {selectedRestaurantDetails.photo && (
                <CardMedia 
                  component="img" 
                  image={selectedRestaurantDetails.photo} 
                  alt={selectedRestaurantDetails.name} 
                  sx={{ borderRadius: 2, maxHeight: 200, objectFit: 'cover' }} 
                />
              )}
              <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="action" /> {selectedRestaurantDetails.address}
              </Typography>
              {selectedRestaurantDetails.phoneNumber && (
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone color="action" /> {selectedRestaurantDetails.phoneNumber}
                </Typography>
              )}
              {selectedRestaurantDetails.website && (
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Public color="action" /> <a href={selectedRestaurantDetails.website} target="_blank" rel="noopener noreferrer">{selectedRestaurantDetails.website}</a>
                </Typography>
              )}
              {selectedRestaurantDetails.openingHours && selectedRestaurantDetails.openingHours.length > 0 && (
                <Box>
                  <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime color="action" /> Opening Hours:
                  </Typography>
                  <List dense disablePadding sx={{ ml: 3 }}>
                    {selectedRestaurantDetails.openingHours.map((hour, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText primary={hour} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              {selectedRestaurantDetails.types && selectedRestaurantDetails.types.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedRestaurantDetails.types.map((type, index) => (
                    <Chip key={index} label={type.replace(/_/g, ' ')} size="small" />
                  ))}
                </Box>
              )}
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <Star sx={{ color: '#FFD700', fontSize: '1.2rem' }} /> {selectedRestaurantDetails.rating} ({selectedRestaurantDetails.userRatingsTotal} reviews)
              </Typography>
            </Stack>
          ) : (
            <Typography>No details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RestaurantSwipe;