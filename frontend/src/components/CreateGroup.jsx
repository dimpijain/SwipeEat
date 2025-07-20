import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import axios from 'axios';

const CreateGroup = ({ token }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError('');
    setSuccess(null);
    setLoading(true);
    try {
      const res = await axios.post('/api/groups/create', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Group created! Invite code: ${res.data.group.code}`);
      setName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" mb={2}>Create a Group</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField
        label="Group Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleCreate}
        disabled={!name || loading}
        fullWidth
      >
        {loading ? 'Creating...' : 'Create Group'}
      </Button>
    </Box>
  );
};

export default CreateGroup;
