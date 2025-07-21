import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link,
  CircularProgress,
  useTheme,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Person, Email, Lock, Restaurant } from '@mui/icons-material';

// Color palette
const COLORS = {
  primary: '#FF7F7F',      // Coral
  secondary: '#FFD6B0',    // Peach
  background: '#FFF9FA',   // Cream
  textPrimary: '#575761',  // Dark gray
  cardBackground: '#FFF5F8', // Light pink
  success: '#4CAF50'       // Green
};

// Custom hook for registration logic
const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      navigate('/login', { 
        state: { 
          registrationSuccess: true,
          message: 'Registration successful! Please login.' 
        } 
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error };
};

// InputField component
const InputField = ({ icon, label, type, value, onChange, ...props }) => (
  <TextField
    fullWidth
    variant="outlined"
    label={label}
    type={type}
    value={value}
    onChange={onChange}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Box sx={{ color: COLORS.textPrimary }}>
            {icon}
          </Box>
        </InputAdornment>
      ),
    }}
    sx={{
      mb: 3,
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        backgroundColor: COLORS.background,
      },
      '& .MuiInputLabel-root': {
        color: COLORS.textPrimary,
      },
    }}
    {...props}
  />
);

// RegistrationForm component
const RegistrationForm = ({ onRegister, loading, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(formData);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        borderRadius: 4,
        maxWidth: 450,
        width: '100%',
        bgcolor: 'white',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Restaurant 
          sx={{ 
            fontSize: 50, 
            color: COLORS.primary,
            mb: 1
          }} 
        />
        <Typography 
          variant="h4" 
          fontWeight={700} 
          color={COLORS.primary}
        >
          Join SwipeEat
        </Typography>
        <Typography color={COLORS.textPrimary}>
          Create your account to start sharing meals
        </Typography>
      </Box>
      
      {error && (
        <Typography 
          color="error" 
          mb={2} 
          textAlign="center"
          sx={{ 
            backgroundColor: '#FFEBEE',
            p: 1,
            borderRadius: 1
          }}
        >
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <InputField
          icon={<Person />}
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <InputField
          icon={<Email />}
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <InputField
          icon={<Lock />}
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          inputProps={{ minLength: 6 }}
          helperText="At least 6 characters"
          required
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: 2,
            bgcolor: COLORS.primary,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#FF6F6F',
              boxShadow: '0 4px 12px rgba(255, 127, 127, 0.3)',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
      
      <Typography 
        mt={3} 
        textAlign="center" 
        color={COLORS.textPrimary}
        sx={{ fontSize: '0.9rem' }}
      >
        Already have an account?{' '}
        <Link 
          href="/login" 
          color={COLORS.primary}
          sx={{ 
            fontWeight: 600,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          Sign in
        </Link>
      </Typography>
    </Paper>
  );
};

// Main Register component
const Register = () => {
  const { handleRegister, loading, error } = useRegister();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.cardBackground} 100%)`,
        p: 2,
      }}
    >
      <RegistrationForm 
        onRegister={handleRegister} 
        loading={loading} 
        error={error} 
      />
    </Box>
  );
};

export default Register;
