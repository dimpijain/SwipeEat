import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link,
  CircularProgress,
  useTheme
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Email } from '@mui/icons-material';

// Custom hook for login logic
const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
};

// Color palette
const COLORS = {
  primary: '#FF7F7F',
  secondary: '#FFD6B0',
  background: '#FFF9FA',
  textPrimary: '#575761',
  cardBackground: '#FFF5F8',
  error: '#d32f2f'
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
        <Box sx={{ color: COLORS.textPrimary, mr: 1 }}>
          {icon}
        </Box>
      ),
    }}
    sx={{
      mb: 3,
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        backgroundColor: COLORS.background,
      },
    }}
    {...props}
  />
);

// LoginForm component
const LoginForm = ({ onLogin, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
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
      }}
    >
      <Typography 
        variant="h4" 
        fontWeight={700} 
        color={COLORS.primary} 
        mb={3}
        textAlign="center"
      >
        Welcome to SwipeEat
      </Typography>
      
      {error && (
        <Typography color={COLORS.error} mb={2} textAlign="center">
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <InputField
          icon={<Email />}
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <InputField
          icon={<Lock />}
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
            '&:hover': {
              bgcolor: '#FF6F6F',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
        </Button>
      </form>
      
      <Typography mt={3} textAlign="center" color={COLORS.textPrimary}>
        Don't have an account?{' '}
        <Link href="/register" color={COLORS.primary}>
          Sign up
        </Link>
      </Typography>
    </Paper>
  );
};

// Main Login component
const Login = () => {
  const theme = useTheme();
  const { handleLogin, loading, error } = useLogin();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: COLORS.background,
        p: 2,
      }}
    >
      <LoginForm 
        onLogin={handleLogin} 
        loading={loading} 
        error={error} 
      />
    </Box>
  );
};

export default Login;