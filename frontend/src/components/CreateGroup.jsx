import { useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';

const cuisinesList = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai'];

export default function CreateGroup({ open, onClose, token, onGroupChange }) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('Medium');
  const [location, setLocation] = useState('');
  const [cuisines, setCuisines] = useState([]);

  const handleSubmit = async () => {
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
          },
        }
      );
      onGroupChange(); // Refresh groups list
      onClose(); // Close modal
    } catch (err) {
      console.error(err);
      alert('Error creating group');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
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
        />
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Budget</InputLabel>
          <Select value={budget} onChange={e => setBudget(e.target.value)} label="Budget">
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
                <Checkbox checked={cuisines.indexOf(cuisine) > -1} />
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
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          sx={{ backgroundColor: '#ACBD6B', color: 'white' }} 
          onClick={handleSubmit}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}