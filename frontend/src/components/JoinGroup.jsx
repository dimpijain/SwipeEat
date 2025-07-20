import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import axios from 'axios';

const JoinGroup = ({ token }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setError('');
    setSuccess(null);
    setLoading(true);
    try {
      const res = await axios.post('/api/groups/join', { code }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Successfully joined group: ${res.data.group.name}`);
      setCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" mb={2}>Join a Group</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField
        label="Invite Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleJoin}
        disabled={!code || loading}
        fullWidth
      >
        {loading ? 'Joining...' : 'Join Group'}
      </Button>
    </Box>
  );
};

export default JoinGroup;
