import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { CheckCircle, Share, Directions } from '@mui/icons-material';

const MatchScreen = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  
  // In a real app, you would fetch restaurant details here using the ID
  const restaurantName = "Your Matched Restaurant"; 
  const restaurantAddress = "123 Celebration Lane";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `We've got a match!`,
        text: `Our group decided on ${restaurantName}. See you there!`,
        url: window.location.href,
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 3, textAlign: 'center' }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4, maxWidth: 500 }}>
        <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" gutterBottom>It's a Match!</Typography>
        <Typography variant="h5" color="primary.main" fontWeight="bold">{restaurantName}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>{restaurantAddress}</Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Directions />}
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurantAddress)}`}
            target="_blank"
          >
            Directions
          </Button>
          <Button variant="outlined" startIcon={<Share />} onClick={handleShare}>
            Share
          </Button>
        </Box>
      </Paper>
      <Button onClick={() => navigate('/dashboard')} sx={{ mt: 3 }}>Back to Dashboard</Button>
    </Box>
  );
};

export default MatchScreen;