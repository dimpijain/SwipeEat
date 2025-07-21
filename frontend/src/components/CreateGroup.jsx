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

export default function CreateGroup({ open, onClose }) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('Medium');
  const [location, setLocation] = useState('');
  const [cuisines, setCuisines] = useState([]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/groups/create',
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
      console.log(res.data);
      onClose(); // close modal on success
    } catch (err) {
      console.error(err);
      alert('Error creating group');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle className="text-[#536293] font-bold text-xl">Create a New Group</DialogTitle>
      <DialogContent className="flex flex-col gap-4 py-4">
        <TextField label="Group Name" value={name} onChange={e => setName(e.target.value)} />
        <FormControl>
          <InputLabel>Budget</InputLabel>
          <Select value={budget} onChange={e => setBudget(e.target.value)} label="Budget">
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
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
        />
      </DialogContent>

      <DialogActions className="px-6 pb-4">
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" className="bg-[#ACBD6B] text-white" onClick={handleSubmit}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
