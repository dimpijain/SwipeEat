import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Modal,
  Backdrop,
  Fade,
  AppBar,
  Toolbar,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import SwipeIcon from '@mui/icons-material/SwipeRight';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';

const COLORS = {
  primary: '#FF6F61',
  accent: '#6BFFB8',
  secondary: '#FFD93D',
  bgLight: '#FFF9F5',
  textDark: '#3D3D3D',
  cardBg: '#FFE8E4',
};

// Enhanced Logo Component
const Logo = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <RestaurantIcon sx={{ 
      color: COLORS.primary, 
      fontSize: 34,
      transform: 'rotate(-15deg)' 
    }} />
    <Typography
      variant="h4"
      sx={{
        fontWeight: 800,
        background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: { xs: '1.8rem', md: '2.2rem' },
      }}
    >
      SwipeEat
    </Typography>
  </Box>
);

const Homepage = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const handleLoginSuccess = () => {
    alert('Logged in successfully!');
    setIsSignInOpen(false);
  };

  const handleRegisterSuccess = () => {
    alert('Registered successfully!');
    setIsRegisterOpen(false);
  };

  const features = [
    {
      icon: <GroupIcon sx={{ color: COLORS.primary, fontSize: 40 }} />,
      title: 'Create Groups',
      description: 'Invite friends with a link or code.',
      color: COLORS.secondary,
    },
    {
      icon: <SwipeIcon sx={{ color: COLORS.accent, fontSize: 40 }} />,
      title: 'Swipe to Choose',
      description: 'Swipe through restaurant options.',
      color: COLORS.primary,
    },
    {
      icon: <RestaurantMenuIcon sx={{ color: COLORS.secondary, fontSize: 40 }} />,
      title: 'Discover Restaurants',
      description: 'Find great places near you.',
      color: COLORS.accent,
    },
  ];
  
  const navigate = useNavigate();
  
  return (
    <Box sx={{ backgroundColor: COLORS.bgLight, minHeight: '100vh' }}>
      {/* Header with Left-Aligned Logo */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          backgroundColor: 'transparent',
          py: 3,
          px: { xs: 3, md: 6 },
        }}
      >
        <Toolbar sx={{ justifyContent: 'flex-start', px: 0 }}>
          <Logo />
        </Toolbar>
      </AppBar>

      {/* Adjusted Hero Section with less top padding */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 4, md: 6 },
            px: { xs: 3, md: 8 },
            backgroundColor: 'white',
            borderRadius: 4,
            boxShadow: '0 10px 30px rgba(255,111,97,0.15)',
            mb: 8,
            mt: 4,
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: COLORS.primary,
              mb: 2,
              fontSize: { xs: '2.4rem', md: '3.6rem' },
              lineHeight: 1.2,
            }}
          >
            No More 'Where to eat?'
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: COLORS.textDark,
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 500,
              mb: 4,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
            }}
          >
            Swipe. Match. Eat. The easiest way to choose a restaurant with your friends.
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 3, 
            flexWrap: 'wrap',
            mt: 4 
          }}>
            <Button
              variant="contained"
              onClick={() => navigate("/register")}
              sx={{
                backgroundColor: COLORS.primary,
                color: 'white',
                fontWeight: 700,
                fontSize: '1.15rem',
                px: 5,
                py: 1.8,
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 12px ${COLORS.primary}80`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsSignInOpen(true)}
              sx={{
                borderColor: COLORS.primary,
                color: COLORS.primary,
                fontWeight: 700,
                fontSize: '1.15rem',
                px: 5,
                py: 1.8,
                borderRadius: 3,
                '&:hover': {
                  backgroundColor: `${COLORS.primary}10`,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Typography
          variant="h4"
          align="center"
          sx={{ 
            mb: 6, 
            fontWeight: 700, 
            color: COLORS.textDark,
            fontSize: { xs: '1.8rem', md: '2.2rem' } 
          }}
        >
          How It Works
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 4,
                  backgroundColor: COLORS.cardBg,
                  boxShadow: `0 8px 15px ${COLORS.primary}33`,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  }
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: feature.color,
                    width: 70,
                    height: 70,
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  {feature.icon}
                </Avatar>
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: COLORS.textDark, opacity: 0.8 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <Box
          sx={{
            mt: 10,
            py: 8,
            textAlign: 'center',
            backgroundColor: COLORS.primary,
            borderRadius: 4,
            color: 'white',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            Ready to Find Your Perfect Restaurant?
          </Typography>
          <Button
            variant="contained"
            onClick={() => setIsRegisterOpen(true)}
            sx={{
              backgroundColor: 'white',
              color: COLORS.primary,
              fontWeight: 700,
              px: 6,
              py: 1.8,
              borderRadius: 3,
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Start Swiping Now
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ 
        textAlign: 'center', 
        py: 4,
        color: '#A0A0A0',
        fontSize: '0.9rem'
      }}>
        Made with 🍔 by Dimpi Jain
      </Box>

      {/* Modals (unchanged) */}
      <Modal
        open={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,
          sx: { backdropFilter: 'blur(5px)' },
        }}
      >
        <Fade in={isSignInOpen}>
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'white',
              p: 4,
              borderRadius: 3,
              boxShadow: 24,
              minWidth: 340,
              maxWidth: 400,
              width: '90%',
              position: 'relative',
            }}
          >
            <LoginModal
              isOpen={isSignInOpen}
              onLoginSuccess={handleLoginSuccess}
              onClose={() => setIsSignInOpen(false)}
            />
          </Box>
        </Fade>
      </Modal>

      <Modal
        open={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,
          sx: { backdropFilter: 'blur(5px)' },
        }}
      >
        <Fade in={isRegisterOpen}>
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'white',
              p: 4,
              borderRadius: 3,
              boxShadow: 24,
              minWidth: 340,
              maxWidth: 400,
              width: '90%'
            }}
          >
            <LoginModal
              isOpen={isRegisterOpen}
              onRegisterSuccess={handleRegisterSuccess}
              onClose={() => setIsRegisterOpen(false)}
            />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Homepage;