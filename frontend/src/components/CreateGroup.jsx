import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Select, MenuItem, InputLabel,
  FormControl, Checkbox, ListItemText, OutlinedInput,
  CircularProgress
} from '@mui/material';

const cuisinesList = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai'];

export default function CreateGroup({ open, onClose, token, onGroupChange }) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('Medium');
  const [location, setLocation] = useState('');
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setLoading(true);
    
    try {
      const res = await axios.post(
        'http://localhost:5000/api/group/create',
        {
          name,
          preferences: {
            budget,
            cuisine: cuisines,
            location,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (res.data.success) {
        toast.success(`Group created! Join code: ${res.data.group.joinCode}`);
        onGroupChange();
        onClose();
        // Reset form
        setName('');
        setBudget('Medium');
        setLocation('');
        setCuisines([]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to create group';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ 
        color: '#536293', 
        fontWeight: 'bold', 
        fontSize: '1.25rem',
        textAlign: 'center'
      }}>
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
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: '#ACBD6B', 
            color: 'white',
            minWidth: 120
          }} 
          onClick={handleSubmit}
          disabled={!name || loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}