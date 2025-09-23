import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Lock, Email, ArrowBack } from '@mui/icons-material';
import api from '../api'; 
const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
     
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
};

const COLORS = {
  primary: '#FF7F7F',
  secondary: '#FFD6B0',
  background: '#FFF9FA',
  textPrimary: '#575761',
  cardBackground: '#FFF5F8',
  error: '#d32f2f'
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
        <Box sx={{ color: COLORS.textPrimary, mr: 1, display: 'flex' }}>
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
        p: { xs: 4, sm: 5 },
        borderRadius: 4,
        maxWidth: 500,
        width: '100%',
        bgcolor: 'white',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
      }}
    >
      <Typography 
        variant="h4" 
        fontWeight={700} 
        color={COLORS.primary} 
        mb={3}
        textAlign="center"
      >
        Welcome Back!
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
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
        <Link href="/register" color={COLORS.primary} sx={{ fontWeight: 600 }}>
          Sign up
        </Link>
      </Typography>
    </Paper>
  );
};

const Login = () => {
  const { handleLogin, loading, error } = useLogin();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: COLORS.background,
        p: 2,
        position: 'relative' 
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
      
      <LoginForm 
        onLogin={handleLogin} 
        loading={loading} 
        error={error} 
      />
    </Box>
  );
};

export default Login;