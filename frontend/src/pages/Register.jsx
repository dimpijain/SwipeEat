import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link,
  CircularProgress,
  InputAdornment,
  Alert,  
  IconButton 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Person, Email, Lock, Restaurant, ArrowBack } from '@mui/icons-material';

const COLORS = {
  primary: '#FF7F7F',
  secondary: '#FFD6B0',
  background: '#FFF9FA',
  textPrimary: '#575761',
  cardBackground: '#FFF5F8',
  success: '#4CAF50'
};

const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      
      await api.post('/api/auth/register', formData);

      navigate('/login', { 
        state: { 
          registrationSuccess: true,
          message: 'Registration successful! Please login.' 
        } 
      });
    } catch (err) {

      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error };
};

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
          <Box sx={{ color: COLORS.textPrimary, display: 'flex' }}>
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

const RegistrationForm = ({ onRegister, loading, error }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

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
        
        p: 7,
        borderRadius: 4,
        maxWidth: 750,
        width: '100%',
        bgcolor: 'white',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Restaurant sx={{ fontSize: 50, color: COLORS.primary, mb: 1 }} />
        <Typography variant="h4" fontWeight={700} color={COLORS.primary}>
          Join SwipeEat
        </Typography>
        <Typography color={COLORS.textPrimary}>
          Create an account to start deciding
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
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
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
        </Button>
      </form>
      
      <Typography mt={3} textAlign="center" color={COLORS.textPrimary}>
        Already have an account?{' '}
        <Link href="/login" color={COLORS.primary} sx={{ fontWeight: 600 }}>
          Sign in
        </Link>
      </Typography>
    </Paper>
  );
};

const Register = () => {
  const { handleRegister, loading, error } = useRegister();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.cardBackground} 100%)`,
        p: 2,
        position: 'relative', 
      }}
    >
      
      <IconButton 
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          bgcolor: 'white',
          '&:hover': { bgcolor: '#f5f5f5' }
        }}
      >
        <ArrowBack />
      </IconButton>

      <RegistrationForm 
        onRegister={handleRegister} 
        loading={loading} 
        error={error} 
      />
    </Box>
  );
};

export default Register;