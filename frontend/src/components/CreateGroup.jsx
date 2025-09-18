import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  CircularProgress, Box, Slider, Typography, FormControl, InputLabel,
  Select, MenuItem, Chip, OutlinedInput
} from '@mui/material';
import api from '../api'; // ✅ CHANGE: Import the dedicated 'api' instance
import { toast } from 'react-toastify';

const COLORS = {
  primary: '#FF7F7F',
  textPrimary: '#575761',
};

// A list of common cuisines for the dropdown
const cuisineOptions = [
  'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'American', 'Mediterranean',
];

// ✅ CHANGE: The 'token' prop is no longer needed, as the 'api' instance handles it automatically
const CreateGroup = ({ open, onClose, onGroupChange }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(5);
  const [cuisinePreferences, setCuisinePreferences] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCuisineChange = (event) => {
    const { target: { value } } = event;
    setCuisinePreferences(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !location.trim()) {
      toast.error('Group name and location are required.');
      return;
    }
    setLoading(true);
    try {
      // ✅ CHANGE: Use 'api.post' for the request
      const response = await api.post(
        '/api/group/create',
        {
          name,
          location,
          radius,
          cuisinePreferences,
        }
      );
      if (response.data.success) {
        toast.success('Group created successfully!');
        onGroupChange();
        onClose();
        // Reset all form fields
        setName('');
        setLocation('');
        setRadius(5);
        setCuisinePreferences([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: COLORS.primary }}>
        Create a New Group
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Group Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField
          margin="dense"
          label="Location (e.g., Patiala, Punjab)"
          type="text"
          fullWidth
          variant="outlined"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        
        <FormControl fullWidth margin="dense">
          <InputLabel>Cuisine Preferences</InputLabel>
          <Select
            multiple
            value={cuisinePreferences}
            onChange={handleCuisineChange}
            input={<OutlinedInput label="Cuisine Preferences" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {cuisineOptions.map((cuisine) => (
              <MenuItem key={cuisine} value={cuisine}>
                {cuisine}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 3, px: 1 }}>
          <Typography gutterBottom>
            Search Radius: <strong>{radius} km</strong>
          </Typography>
          <Slider
            value={radius}
            onChange={(e, newValue) => setRadius(newValue)}
            aria-labelledby="radius-slider"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={50}
            sx={{ color: COLORS.primary }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: COLORS.textPrimary }}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primary } }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroup;