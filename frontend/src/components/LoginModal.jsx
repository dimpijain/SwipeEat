import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const LoginModal = ({ onClose, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        onLoginSuccess(res.data);
        onClose();
        navigate('/dashboard'); // Redirect to dashboard after login
      } else {
        throw new Error('Authentication failed: No token received');
      }
    } catch (err) {
      console.error('Full error details:', {
        message: err.message,
        response: err.response?.data,
        config: err.config,
      });

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h5" mb={2} fontWeight={700}>
        Sign In
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>
      <Typography mt={2} align="center">
        Not a user?{' '}
        <MuiLink
          component={Link}
          to="/register"
          underline="hover"
          sx={{ cursor: 'pointer' }}
        >
          Sign Up
        </MuiLink>
      </Typography>
    </Box>
  );
};

export default LoginModal;
