import { useState } from 'react';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Select, MenuItem, InputLabel,
  FormControl, Checkbox, ListItemText, OutlinedInput,
  Snackbar, Alert
} from '@mui/material';

const cuisinesList = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai'];

const generateGroupCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function CreateGroup({ open, onClose, token, onGroupChange }) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('Medium');
  const [location, setLocation] = useState('');
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    const groupCode = generateGroupCode();

    try {
      const res = await axios.post(
        'http://localhost:5000/api/group/create',
        {
          name,
          groupCode,
          preferences: {
            budget,
            cuisine: cuisines,
            location,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setSuccess(true);
        onGroupChange();
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1000);
      } else {
        setError(res.data.message || 'Failed to create group');
      }
    } catch (err) {
      console.error('Create group error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: '#536293', fontWeight: 'bold', fontSize: '1.25rem' }}>
          Create a New Group
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
          <TextField 
            label="Group Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            fullWidth
            margin="normal"
            required
          />
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Budget</InputLabel>
            <Select 
              value={budget} 
              onChange={e => setBudget(e.target.value)} 
              label="Budget"
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Cuisine Preferences</InputLabel>
            <Select
              multiple
              value={cuisines}
              onChange={e => setCuisines(e.target.value)}
              input={<OutlinedInput label="Cuisines" />}
              renderValue={selected => selected.join(', ')}
            >
              {cuisinesList.map(cuisine => (
                <MenuItem key={cuisine} value={cuisine}>
                  <Checkbox checked={cuisines.includes(cuisine)} />
                  <ListItemText primary={cuisine} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            variant="contained" 
            sx={{ backgroundColor: '#ACBD6B', color: 'white' }} 
            onClick={handleSubmit}
            disabled={!name || loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error || success}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={success ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {success ? 'Group created successfully!' : error}
        </Alert>
      </Snackbar>
    </>
  );
}