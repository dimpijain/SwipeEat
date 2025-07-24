import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

const JoinGroup = ({ token, onJoinSuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) {
      toast.error('Please enter a group code');
      return;
    }

    setLoading(true);
    
    try {
      const res = await axios.post(
        'http://localhost:5000/api/group/join', 
        { code: code.toUpperCase() }, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (res.data.success) {
        toast.success(`Successfully joined group: ${res.data.group.name}`);
        setCode('');
        if (onJoinSuccess) onJoinSuccess();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to join group';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 400, 
      mx: 'auto', 
      mt: 4,
      p: 3,
      boxShadow: 1,
      borderRadius: 2,
      bgcolor: 'background.paper'
    }}>
      <Typography variant="h5" mb={3} textAlign="center">
        Join a Group
      </Typography>
      
      <TextField
        fullWidth
        label="Group Invite Code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        margin="normal"
        inputProps={{ maxLength: 6 }}
        placeholder="Enter 6-digit code"
      />
      <Button
        variant="contained"
        onClick={handleJoin}
        disabled={loading || !code.trim()}
        fullWidth
        sx={{ mt: 2, py: 1.5 }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : 'Join Group'}
      </Button>
    </Box>
  );
};

export default JoinGroup;