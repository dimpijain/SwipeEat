import React, { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import { Box, Card, CardMedia, CardContent, Typography, IconButton, Chip, Button, Paper, Alert, AppBar, Toolbar, Badge } from '@mui/material';
import { Close, Favorite, ArrowBack, Star, CheckCircleOutline, Fastfood, ThumbUp } from '@mui/icons-material';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const COLORS = {
  primary: '#FF7F7F',
  secondary: '#FFD6B0',
  background: '#FFF9FA',
  textPrimary: '#575761',
  cardBackground: '#FFFFFF',
  accent: '#B5EAD7'
};

const RestaurantSwipeLayout = ({ restaurants, currentIndex, votes, onSwipe, error }) => {
  const navigate = useNavigate();
  const childRefs = useRef([]);
  
  if (restaurants.length > 0) {
    childRefs.current = Array(restaurants.length).fill(0).map((_, i) => childRefs.current[i] || React.createRef());
  }

  const handleSwipeButton = async (dir) => {
    if (currentIndex < 0 || !restaurants[currentIndex]) return;
    await childRefs.current[currentIndex]?.current?.swipe(dir);
  };
  
  const getPriceLevel = (level) => level ? '$'.repeat(level) : '';

  const renderCards = useMemo(() => {
    if (error) {
      return (
        <Paper elevation={4} sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: COLORS.cardBackground }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ bgcolor: COLORS.primary }}>
            Back to Dashboard
          </Button>
        </Paper>
      );
    }
    
    if (currentIndex < 0) {
      return (
        <Paper elevation={4} sx={{ p: 4, textAlign: 'center', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CheckCircleOutline sx={{ fontSize: 60, color: COLORS.accent }} />
            <Typography variant="h5" fontWeight={700}>Session Finished!</Typography>
            <Typography color="text.secondary">Waiting for final results from the group...</Typography>
        </Paper>
      );
    }
    
    return restaurants.map((restaurant, index) => (
      // ✅ FIX: Only render the card if its index is part of the current stack.
      index <= currentIndex ? (
        <TinderCard
          ref={childRefs.current[index]}
          key={restaurant.id}
          onSwipe={(dir) => onSwipe(dir, restaurant.id)}
          preventSwipe={['up', 'down']}
          className="swipe"
          style={{ zIndex: restaurants.length - index }}
        >
          <Card sx={{ width: '100%', height: '100%', borderRadius: 4, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
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
      ) : null
    ));
  }, [restaurants, currentIndex, votes, error, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.secondary} 100%)`, position: 'relative', overflow: 'hidden' }}>
      <AppBar position="static" sx={{ bgcolor: 'transparent', boxShadow: 'none', zIndex: 1 }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ color: COLORS.textPrimary }}><ArrowBack /></IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
             <Fastfood sx={{ color: COLORS.primary, mr: 1, alignSelf: 'center' }} /><Typography variant="h5" fontWeight={800} color={COLORS.primary} sx={{ fontFamily: "'Pacifico', cursive" }}>SwipeEat</Typography>
          </Box>
          <Box sx={{width: 40}} /> 
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, gap: 3, zIndex: 1 }}>
        <Typography variant="h4" fontWeight={700} color={COLORS.textPrimary} textAlign="center">Discover Dining Spots</Typography>
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 350, height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {renderCards}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, alignItems: 'center', height: 80, mt: 2 }}>
          <IconButton onClick={() => handleSwipeButton('left')} sx={{ bgcolor: 'white', color: COLORS.textPrimary, boxShadow: 3, width: 64, height: 64, transition: 'transform 0.2s', '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' } }}><Close sx={{ fontSize: 32 }} /></IconButton>
          <IconButton onClick={() => handleSwipeButton('right')} sx={{ bgcolor: COLORS.primary, color: 'white', boxShadow: 3, width: 80, height: 80, transition: 'transform 0.2s', '&:hover': { bgcolor: COLORS.primary, transform: 'scale(1.1)' } }}><Favorite sx={{ fontSize: 40 }}/></IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default RestaurantSwipeLayout;