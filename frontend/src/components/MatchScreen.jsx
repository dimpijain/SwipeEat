import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { Celebration, Share, ArrowBack } from '@mui/icons-material';
import ReactConfetti from 'react-confetti';

const COLORS = {
  primary: '#FF7F7F',
  secondary: '#FFD6B0',
  background: '#FFF9FA',
  textPrimary: '#575761',
  cardBackground: '#FFF5F8',
};

const useWindowSize = () => {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

const MatchScreen = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [width, height] = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  
  const restaurantName = "Your Matched Restaurant"; 
  const restaurantAddress = "123 Celebration Lane";

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `We've got a match on SwipeEat!`,
        text: `Our group decided on ${restaurantName}. Let's go!`,
        url: window.location.href,
      });
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        p: 3, 
        textAlign: 'center',
        background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.cardBackground} 100%)`,
        position: 'relative'
      }}
    >
      <ReactConfetti
        width={width}
        height={height}
        numberOfPieces={showConfetti ? 200 : 0}
        recycle={false}
      />
      
      <Paper 
        elevation={6} 
        sx={{ 
          p: { xs: 4, sm: 6 }, 
          borderRadius: 5, 
          // ✅ CHANGED: Increased max-width to make the box larger
          maxWidth: '650px', 
          width: '100%',
          bgcolor: 'white', 
        }}
      >
        <Celebration sx={{ fontSize: 80, mb: 2, color: COLORS.primary }} />
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 800, color: COLORS.primary }}>
          It's a Match!
        </Typography>
        <Typography variant="h4" fontWeight="bold" sx={{ color: COLORS.textPrimary }}>
          {restaurantName}
        </Typography>
        <Typography variant="h6" sx={{ mt: 1.5, mb: 4, color: COLORS.textPrimary }}>
          {restaurantAddress}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<Share />}
            onClick={handleShare}
            size="large"
            sx={{
              bgcolor: COLORS.primary,
              fontSize: '1.1rem',
              px: 4,
              py: 1.5,
              '&:hover': { bgcolor: '#E56D62' }
            }}
          >
            Share with Group
          </Button>
        </Stack>
      </Paper>
      <Button 
        onClick={() => navigate('/dashboard')} 
        startIcon={<ArrowBack />}
        sx={{ mt: 4, color: COLORS.textPrimary }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default MatchScreen;